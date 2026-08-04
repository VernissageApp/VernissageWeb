import { Routes } from '@angular/router';

import { loggedOutGuard } from '../services/authorization/logged-out-guard.service';
import { authorizationGuard } from '../services/authorization/authorization-guard.service';
import { numericStatusIdCanMatch } from '../common/numeric-status-id-can-match';


export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage), canActivate: [ loggedOutGuard ], title: 'common.pageTitles.login' },
    { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage), canActivate: [ loggedOutGuard ], title: 'common.pageTitles.forgotPassword' },
    { path: 'login-callback', loadComponent: () => import('./login-callback/login-callback.page').then(m => m.LoginCallbackPage), canActivate: [ loggedOutGuard ] },
    { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password.page').then(m => m.ResetPasswordPage), canActivate: [ loggedOutGuard ], title: 'common.pageTitles.resetPassword' },
    { path: 'register', loadComponent: () => import('./register/register.page').then(m => m.RegisterPage), canActivate: [ loggedOutGuard ], title: 'common.pageTitles.register' },
    { path: 'confirm-email', loadComponent: () => import('./confirm-email/confirm-email.page').then(m => m.ConfirmEmailPage), title: 'common.pageTitles.confirmEmail' },
    { path: 'account', loadComponent: () => import('./account/account.page').then(m => m.AccountPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.account' },
    { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage), data: { reuse: true }, title: 'common.pageTitles.homeTimeline' },
    { path: 'access-forbidden', loadComponent: () => import('./errors/access-forbidden/access-forbidden.page').then(m => m.AccessForbiddenPage), title: 'common.pageTitles.accessForbidden' },
    { path: 'unexpected-error', loadComponent: () => import('./errors/unexpected-error/unexpected-error.page').then(m => m.UnexpectedErrorPage), title: 'common.pageTitles.unexpectedError' },
    { path: 'connection-lost', loadComponent: () => import('./errors/connection-lost/connection-lost.page').then(m => m.ConnectionLostPage), title: 'common.pageTitles.connectionLost' },
    { path: 'page-not-found', loadComponent: () => import('./errors/page-not-found/page-not-found.page').then(m => m.PageNotFoundPage), title: 'common.pageTitles.pageNotFound' },
    { path: 'upload', loadComponent: () => import('./upload/upload.page').then(m => m.UploadPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.uploadImages' },
    { path: 'search', loadComponent: () => import('./search/search.page').then(m => m.SearchPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.search' },
    { path: 'notifications', loadComponent: () => import('./notifications/notifications.page').then(m => m.NotificationsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.notifications' },
    { path: 'invitations', loadComponent: () => import('./invitations/invitations.page').then(m => m.InvitationsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.invitations' },
    { path: 'settings', loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.settings' },
    { path: 'trending', loadComponent: () => import('./trending/trending.page').then(m => m.TrendingPage), data: { reuse: true }, title: 'common.pageTitles.trending' },
    { path: 'editors', loadComponent: () => import('./editors/editors.page').then(m => m.EditorsPage), data: { reuse: true }, title: 'common.pageTitles.editorsChoice' },
    { path: 'explore', loadComponent: () => import('./explore/explore.page').then(m => m.ExplorePage), data: { reuse: true }, title: 'common.pageTitles.explore' },
    { path: 'categories', redirectTo: '/explore', pathMatch: 'full' },
    { path: 'preferences', loadComponent: () => import('./preferences/preferences.page').then(m => m.PreferencesPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.preferences' },
    { path: 'reports', loadComponent: () => import('./reports/reports.page').then(m => m.ReportsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.reports' },
    { path: 'tags/:tag', loadComponent: () => import('./hashtag/hashtag.page').then(m => m.HashtagPage), data: { reuse: true }, title: 'common.pageTitles.tags' },
    { path: 'categories/:category', loadComponent: () => import('./category/category.page').then(m => m.CategoryPage), data: { reuse: true }, title: 'common.pageTitles.categories' },
    { path: 'cameras/:camera', loadComponent: () => import('./camera/camera.page').then(m => m.CameraPage), data: { reuse: true }, title: 'common.pageTitles.cameras' },
    { path: 'lenses/:lens', loadComponent: () => import('./lens/lens.page').then(m => m.LensPage), data: { reuse: true }, title: 'common.pageTitles.lenses' },
    { path: 'films/:film', loadComponent: () => import('./film/film.page').then(m => m.FilmPage), data: { reuse: true }, title: 'common.pageTitles.films' },
    { path: 'support', loadComponent: () => import('./support/support.page').then(m => m.SupportPage), title: 'common.pageTitles.support' },
    { path: 'terms', loadComponent: () => import('./terms/terms.page').then(m => m.TermsPage), title: 'common.pageTitles.terms' },
    { path: 'privacy', loadComponent: () => import('./privacy/privacy.page').then(m => m.PrivacyPage), title: 'common.pageTitles.privacy' },
    { path: 'bookmarks', loadComponent: () => import('./bookmarks/bookmarks.page').then(m => m.BookmarksPage), data: { reuse: true }, title: 'common.pageTitles.bookmarks' },
    { path: 'favourites', loadComponent: () => import('./favourites/favourites.page').then(m => m.FavouritesPage), data: { reuse: true }, title: 'common.pageTitles.favourites' },
    { path: 'users', loadComponent: () => import('./users/users.page').then(m => m.UsersPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.users' },
    { path: 'articles', loadComponent: () => import('./articles/articles.page').then(m => m.ArticlesPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.articles' },
    { path: 'articles/create', loadComponent: () => import('./article-edit/article-edit.page').then(m => m.ArticleEditPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.createArticle' },
    { path: 'articles/:id', loadComponent: () => import('./article-edit/article-edit.page').then(m => m.ArticleEditPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.editArticle' },
    { path: 'news', loadComponent: () => import('./news/news.page').then(m => m.NewsPage), title: 'common.pageTitles.news' },
    { path: 'news/:id', loadComponent: () => import('./news-preview/news-preview.page').then(m => m.NewsPreviewPage), title: 'common.pageTitles.news' },
    { path: 'faq', loadComponent: () => import('./frequently-asked-questions/frequently-asked-questions.page').then(m => m.FrequentlyAskedQuestionsPage), title: 'common.pageTitles.frequentlyAskedQuestions' },
    { path: 'business-card/edit', loadComponent: () => import('./edit-business-card/edit-business-card.page').then(m => m.EditBusinessCardPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.editUsersBusinessCard' },
    { path: 'shared-cards', loadComponent: () => import('./shared-cards/shared-cards.page').then(m => m.SharedCardsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.sharedBusinessCards' },
    { path: 'shared-cards/:id', loadComponent: () => import('./shared-card/shared-card.page').then(m => m.SharedCardPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.sharedBusinessCard' },
    { path: 'cards/:code', loadComponent: () => import('./shared-card-public/shared-card-public.page').then(m => m.SharedCardPublicPage), title: 'common.pageTitles.sharedBusinessCard' },
    { path: 'error-items', loadComponent: () => import('./error-items/error-items.page').then(m => m.ErrorItemsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.errors' },
    { path: 'activity-pub-events', loadComponent: () => import('./activity-pub-events/activity-pub-events.page').then(m => m.ActivityPubEventsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.activityPubEvents'},
    { path: 'activity-pub-events/:eventId/items', loadComponent: () => import('./activity-pub-event-items/activity-pub-event-items.page').then(m => m.ActivityPubEventItemsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.activityPubEventRecipients'},
    { path: 'actors/:userName', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage), data: { reuse: true }, children: [
        { path: 'posts', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
        { path: 'following', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
        { path: 'followers', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) }
    ]},
    { path: ':userName', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage), data: { reuse: true }, children: [
        { path: 'posts', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
        { path: 'following', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
        { path: 'followers', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) }
    ]},
    { path: ':userName/:id', loadComponent: () => import('./status/status.page').then(m => m.StatusPage), canMatch: [ numericStatusIdCanMatch ] },
    { path: 'statuses/:id/edit', loadComponent: () => import('./upload/upload.page').then(m => m.UploadPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.uploadImages' },
    { path: 'statuses/:id/events', loadComponent: () => import('./status-events/status-events.page').then(m => m.StatusEventsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.statusEvents' },
    { path: 'statuses/:id/events/:eventId/items', loadComponent: () => import('./status-event-items/status-event-items.page').then(m => m.StatusEventItemsPage), canActivate: [ authorizationGuard ], title: 'common.pageTitles.eventRecipients' },
    { path: 'statuses/:id', loadComponent: () => import('./status/status.page').then(m => m.StatusPage), canMatch: [ numericStatusIdCanMatch ] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', loadComponent: () => import('./errors/page-not-found/page-not-found.page').then(m => m.PageNotFoundPage) }
];
