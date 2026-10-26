import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WindowService } from '../services/common/window.service';
import { LocalMentionsPipe } from './local-mentions.pipe';

describe('LocalMentionsPipe', () => {
    let pipe: LocalMentionsPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LocalMentionsPipe, {
                provide: WindowService,
                useValue: { getApplicationBaseUrl: () => 'https://vernissage.photos' }
            }]
        });
        pipe = TestBed.inject(LocalMentionsPipe);
    });

    it('shortens local mentions while preserving their profile links and surrounding content', () => {
        const html = '<p><a href="https://vernissage.photos/@alice">@alice@vernissage.photos</a> Hello<br>Everyone</p>';

        expect(pipe.transform(html)).toBe('<p><a href="https://vernissage.photos/@alice">@alice</a> Hello<br>Everyone</p>');
    });

    it('keeps remote mentions, email addresses and ordinary links unchanged', () => {
        const html = '<a href="https://remote.example/@bob">@bob@remote.example</a> '
            + '<a href="mailto:alice@vernissage.photos">alice@vernissage.photos</a> '
            + '<a href="https://vernissage.photos">https://vernissage.photos</a>';

        expect(pipe.transform(html)).toBe(html);
    });

    it('supports nested labels and case-insensitive domains without matching subdomains', () => {
        const html = '<a href="/profile"><span>@alice@VERNISSAGE.PHOTOS</span></a> '
            + '<a href="/remote">@bob@other.vernissage.photos</a>';

        expect(pipe.transform(html)).toBe('<a href="/profile">@alice</a> <a href="/remote">@bob@other.vernissage.photos</a>');
    });
});
