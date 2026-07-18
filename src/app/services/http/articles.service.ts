import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { Article } from 'src/app/models/article';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { ArticleFileInfo } from 'src/app/models/article-file-info';
import { ArticlesCountDto } from 'src/app/models/articles-count';

@Injectable({
    providedIn: 'root'
})
export class ArticlesService {
    public changes = new BehaviorSubject<number>(0);

    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async all(page: number, size: number, visibility: ArticleVisibility, dismissed: boolean, language?: string | null): Promise<PagedResult<Article>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('visibility', visibility)
            .set('dismissed', dismissed ? 'true' : 'false');

        if (language) {
            params = params.set('language', language);
        }

        const event$ = this.httpClient.get<PagedResult<Article>>(this.windowService.apiUrl() +  '/api/v1/articles', { params });
        return await firstValueFrom(event$);
    }

    public async get(page: number, size: number, dismissed: boolean): Promise<PagedResult<Article>> {
        const event$ = this.httpClient.get<PagedResult<Article>>(this.windowService.apiUrl() + `/api/v1/articles?page=${page}&size=${size}&dismissed=${dismissed ? 'true' : 'false'}`);
        return await firstValueFrom(event$);
    }

    public async read(id: string): Promise<Article> {
        const event$ = this.httpClient.get<Article>(this.windowService.apiUrl() + `/api/v1/articles/${id}`);
        return await firstValueFrom(event$);
    }

    public async create(article: Article): Promise<Article> {
        const event$ = this.httpClient.post<Article>(this.windowService.apiUrl() + '/api/v1/articles', article);
        return await firstValueFrom(event$);
    }

    public async update(id: string, article: Article): Promise<Article> {
        const event$ = this.httpClient.put<Article>(this.windowService.apiUrl() + '/api/v1/articles/' + id, article);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/articles/' + id);
        return await firstValueFrom(event$);
    }

    public async fileUpload(id: string, formData: FormData): Promise<ArticleFileInfo> {
        const event$ = this.httpClient.post<ArticleFileInfo>(this.windowService.apiUrl() + '/api/v1/articles/' + id + '/file', formData);
        return await firstValueFrom(event$);
    }

    public async fileDelete(id: string, fileId: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/articles/' + id + '/file/' + fileId);
        return await firstValueFrom(event$);
    }

    public async markAsMainFile(id: string, fileId: string): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/articles/' + id + '/file/' + fileId + '/main', null);
        return await firstValueFrom(event$);
    }

    public async dismiss(id: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + `/api/v1/articles/${id}/dismiss`, null);
        await firstValueFrom(event$);
    }

    public async count(language: string): Promise<ArticlesCountDto> {
        const event$ = this.httpClient.get<ArticlesCountDto>(this.windowService.apiUrl() +  `/api/v1/articles/count/${encodeURIComponent(language)}`);
        return await firstValueFrom(event$);
    }

    public async marker(articleId: string, language: string): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        const event$ = this.httpClient.post(this.windowService.apiUrl() +  `/api/v1/articles/marker/${articleId}/${encodeURIComponent(language)}`, null);
        await firstValueFrom(event$);
    }
}
