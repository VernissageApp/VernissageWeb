import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { Article } from 'src/app/models/article';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { ArticleFileInfo } from 'src/app/models/article-file-info';

@Injectable({
    providedIn: 'root'
})
export class ArticlesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async all(page: number, size: number, visibility: ArticleVisibility, dismissed: boolean): Promise<PagedResult<Article>> {
        const event$ = this.httpClient.get<PagedResult<Article>>(this.windowService.apiUrl() +  `/api/v1/articles?page=${page}&size=${size}&visibility=${visibility}&dismissed=${dismissed ? 'true' : 'false'}`);
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
}
