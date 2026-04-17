import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, OnDestroy, signal, viewChild, viewChildren } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { AvatarSize } from '../avatar/avatar-size';
import { Hashtag } from 'src/app/models/hashtag';
import { User } from 'src/app/models/user';
import { SearchService } from 'src/app/services/http/search.service';

type StatusAutocompleteType = 'hashtags' | 'users';

interface StatusAutocompleteContext {
    type: StatusAutocompleteType;
    start: number;
    end: number;
    query: string;
}

interface StatusAutocompleteSuggestion {
    id: string;
    type: StatusAutocompleteType;
    value: string;
    hashtag?: Hashtag;
    user?: User;
}

@Component({
    selector: 'app-status-text-autocomplete',
    templateUrl: './status-text-autocomplete.component.html',
    styleUrls: ['./status-text-autocomplete.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusTextAutocompleteComponent implements OnDestroy {
    public name = input.required<string>();
    public label = input('Text');
    public maxLength = input(500);
    public showPascalCaseHint = input(false);
    public isRequired = input(false);

    public text = model('');

    protected readonly avatarSize = AvatarSize;
    protected autocompleteSuggestions = signal<StatusAutocompleteSuggestion[]>([]);
    protected autocompleteSelectedIndex = signal(0);
    protected autocompleteType = signal<StatusAutocompleteType | undefined>(undefined);

    protected textArea = viewChild<ElementRef<HTMLTextAreaElement>>('textArea');
    protected autocompletePanel = viewChild<ElementRef<HTMLDivElement>>('autocompletePanel');
    protected autocompleteOptions = viewChildren<ElementRef<HTMLElement>>('autocompleteOption');

    private readonly autocompleteDebounceMs = 200;
    private readonly maxAutocompleteSuggestions = 8;

    private autocompleteContext?: StatusAutocompleteContext;
    private autocompleteTimer?: ReturnType<typeof setTimeout>;
    private autocompleteRequestId = 0;

    private searchService = inject(SearchService);

    ngOnDestroy(): void {
        this.clearAutocompleteTimer();
    }

    protected onTextChange(): void {
        this.updateAutocompleteSuggestions();
    }

    protected onTextKeydown(event: KeyboardEvent): void {
        if (this.autocompleteSuggestions().length === 0) {
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                event.stopPropagation();
                this.moveAutocompleteSelection(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                event.stopPropagation();
                this.moveAutocompleteSelection(-1);
                break;
            case 'Enter':
                event.preventDefault();
                event.stopPropagation();
                this.onAutocompleteSuggestionClick(this.autocompleteSuggestions()[this.autocompleteSelectedIndex()]);
                break;
            case 'Escape':
                event.preventDefault();
                event.stopPropagation();
                this.closeAutocomplete();
                break;
            default:
                break;
        }
    }

    protected onTextCursorChange(event?: KeyboardEvent | MouseEvent): void {
        if (event instanceof KeyboardEvent) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                return;
            }
        }

        this.updateAutocompleteSuggestions();
    }

    protected onTextBlur(): void {
        setTimeout(() => this.closeAutocomplete(), 100);
    }

    protected onAutocompleteSuggestionMouseDown(event: MouseEvent, suggestion: StatusAutocompleteSuggestion): void {
        event.preventDefault();
        this.onAutocompleteSuggestionClick(suggestion);
    }

    protected onAutocompleteSuggestionHover(index: number): void {
        this.autocompleteSelectedIndex.set(index);
    }

    protected onAutocompleteSuggestionClick(suggestion?: StatusAutocompleteSuggestion): void {
        if (!suggestion || !this.autocompleteContext) {
            return;
        }

        const oldText = this.text();
        const before = oldText.slice(0, this.autocompleteContext.start);
        const after = oldText.slice(this.autocompleteContext.end);
        const shouldAddTrailingSpace = this.shouldAddSpaceAfterAutocomplete(after);
        const textToInsert = suggestion.value;
        const trailingSpace = shouldAddTrailingSpace ? ' ' : '';
        const newText = `${before}${textToInsert}${trailingSpace}${after}`;
        const caretPosition = (before + textToInsert + trailingSpace).length;

        this.text.set(newText);
        this.closeAutocomplete();
        this.updateAutocompleteSuggestions();

        setTimeout(() => {
            const textareaElement = this.textArea()?.nativeElement;
            textareaElement?.focus();
            textareaElement?.setSelectionRange(caretPosition, caretPosition);
        });
    }

    private updateAutocompleteSuggestions(): void {
        const textareaElement = this.textArea()?.nativeElement;
        if (!textareaElement) {
            this.closeAutocomplete();
            return;
        }

        const cursorPosition = textareaElement.selectionStart ?? this.text().length;
        const context = this.extractAutocompleteContext(this.text(), cursorPosition);

        if (!context) {
            this.closeAutocomplete();
            return;
        }

        this.autocompleteContext = context;
        this.autocompleteType.set(context.type);
        this.clearAutocompleteTimer();

        this.autocompleteTimer = setTimeout(() => {
            this.runAutocompleteSearch(context);
        }, this.autocompleteDebounceMs);
    }

    private async runAutocompleteSearch(context: StatusAutocompleteContext): Promise<void> {
        const requestId = ++this.autocompleteRequestId;

        try {
            const results = await this.searchService.search(context.query, context.type);
            if (
                requestId !== this.autocompleteRequestId
                || !this.autocompleteContext
                || this.autocompleteContext.type !== context.type
                || this.autocompleteContext.query !== context.query
                || this.autocompleteContext.start !== context.start
                || this.autocompleteContext.end !== context.end
            ) {
                return;
            }

            if (context.type === 'hashtags') {
                const hashtags = (results.hashtags ?? []).slice(0, this.maxAutocompleteSuggestions);
                this.autocompleteSuggestions.set(hashtags.map(hashtag => ({
                    id: hashtag.name,
                    type: 'hashtags',
                    value: `#${hashtag.name}`,
                    hashtag
                })));
            } else {
                const users = (results.users ?? [])
                    .filter(user => !!user.userName)
                    .slice(0, this.maxAutocompleteSuggestions);

                this.autocompleteSuggestions.set(users.map(user => ({
                    id: user.id ?? user.userName ?? '',
                    type: 'users',
                    value: `@${user.userName}`,
                    user
                })));
            }

            this.autocompleteSelectedIndex.set(0);
        } catch (error) {
            console.error(error);
            this.closeAutocomplete();
        }
    }

    private extractAutocompleteContext(text: string, cursorPosition: number): StatusAutocompleteContext | undefined {
        const normalizedCursorPosition = Math.max(0, Math.min(cursorPosition, text.length));
        let tokenStart = normalizedCursorPosition - 1;

        while (tokenStart >= 0 && !/\s/.test(text[tokenStart])) {
            tokenStart--;
        }
        tokenStart++;

        const triggerCharacter = text[tokenStart];
        if (triggerCharacter !== '#' && triggerCharacter !== '@') {
            return undefined;
        }

        if (tokenStart > 0 && !/\s/.test(text[tokenStart - 1])) {
            return undefined;
        }

        const query = text.slice(tokenStart + 1, normalizedCursorPosition);
        if (query.includes('#') || query.includes('@') || /\s/.test(query)) {
            return undefined;
        }

        const type: StatusAutocompleteType = triggerCharacter === '#' ? 'hashtags' : 'users';
        const end = this.findAutocompleteTokenEnd(text, tokenStart + 1);

        return {
            type,
            start: tokenStart,
            end,
            query
        };
    }

    private findAutocompleteTokenEnd(text: string, tokenStart: number): number {
        let index = tokenStart;

        while (index < text.length && !/\s/.test(text[index])) {
            index++;
        }

        return index;
    }

    private moveAutocompleteSelection(offset: number): void {
        const suggestions = this.autocompleteSuggestions();
        if (suggestions.length === 0) {
            return;
        }

        const suggestionsCount = suggestions.length;
        const nextIndex = (this.autocompleteSelectedIndex() + offset + suggestionsCount) % suggestionsCount;
        this.autocompleteSelectedIndex.set(nextIndex);
        this.scrollSelectedAutocompleteOptionIntoView();
    }

    private scrollSelectedAutocompleteOptionIntoView(): void {
        const panel = this.autocompletePanel()?.nativeElement;
        const options = this.autocompleteOptions();
        const selectedOption = options[this.autocompleteSelectedIndex()]?.nativeElement;

        if (!panel || !selectedOption) {
            return;
        }

        const panelTop = panel.scrollTop;
        const panelBottom = panelTop + panel.clientHeight;
        const optionTop = selectedOption.offsetTop;
        const optionBottom = optionTop + selectedOption.offsetHeight;

        if (optionTop < panelTop) {
            panel.scrollTop = optionTop;
            return;
        }

        if (optionBottom > panelBottom) {
            panel.scrollTop = optionBottom - panel.clientHeight;
        }
    }

    private shouldAddSpaceAfterAutocomplete(after: string): boolean {
        if (!after) {
            return true;
        }

        return !/^[\s.,!?;:)\]}]/.test(after);
    }

    private closeAutocomplete(): void {
        this.clearAutocompleteTimer();
        this.autocompleteRequestId++;
        this.autocompleteContext = undefined;
        this.autocompleteSuggestions.set([]);
        this.autocompleteSelectedIndex.set(0);
        this.autocompleteType.set(undefined);
    }

    private clearAutocompleteTimer(): void {
        if (this.autocompleteTimer) {
            clearTimeout(this.autocompleteTimer);
            this.autocompleteTimer = undefined;
        }
    }
}
