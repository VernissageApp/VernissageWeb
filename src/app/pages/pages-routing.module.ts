import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionLostPage } from 'src/app/pages/errors/connection-lost/connection-lost.page';
import { UnexpectedErrorPage } from 'src/app/pages/errors/unexpected-error/unexpected-error.page';
import { ProfilePage } from 'src/app/pages/profile/profile.page';
import { UploadPage } from 'src/app/pages/upload/upload.page';

import { loggedOutGuard } from '../services/authorization/logged-out-guard.service';
import { authorizationGuard } from '../services/authorization/authorization-guard.service';

import { HomePage } from './home/home.page';
import { AccessForbiddenPage } from './errors/access-forbidden/access-forbidden.page';
import { PageNotFoundPage } from './errors/page-not-found/page-not-found.page';
import { LoginPage } from './login/login.page';
import { LoginCallbackPage } from './login-callback/login-callback.page';
import { RegisterPage } from './register/register.page';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';
import { ResetPasswordPage } from './reset-password/reset-password.page';
import { ConfirmEmailPage } from './confirm-email/confirm-email.page';
import { AccountPage } from './account/account.page';
import { SearchPage } from './search/search.page';
import { StatusPage } from './status/status.page';
import { NotificationsPage } from './notifications/notifications.page';
import { InvitationsPage } from './invitations/invitations.page';
import { SettingsPage } from './settings/settings.page';
import { TrendingPage } from './trending/trending.page';
import { EditorsPage } from './editors/editors.page';
import { CategoriesPage } from './categories/categories.page';
import { PreferencesPage } from './preferences/preferences.page';
import { ReportsPage } from './reports/reports.page';
import { UsersPage } from './users/users.page';
import { HashtagPage } from './hashtag/hashtag.page';
import { CategoryPage } from './category/category.page';
import { SupportPage } from './support/support.page';
import { TermsPage } from './terms/terms.page';
import { PrivacyPage } from './privacy/privacy.page';
import { BookmarksPage } from './bookmarks/bookmarks.page';
import { FavouritesPage } from './favourites/favourites.page';
import { ErrorItemsPage } from './error-items/error-items.page';
import { ArticlesPage } from './articles/articles.page';
import { NewsPage } from './news/news.page';
import { EditBusinessCardPage } from './edit-business-card/edit-business-card.page';
import { SharedCardsPage } from './shared-cards/shared-cards.page';
import { SharedCardPage } from './shared-card/shared-card.page';
import { SharedCardPublicPage } from './shared-card-public/shared-card-public.page';
import { ArticleEditPage } from './article-edit/article-edit.page';
import { NewsPreviewPage } from './news-preview/news-preview.page';
import { FrequentlyAskedQuestionsPage } from './frequently-asked-questions/frequently-asked-questions.page';
import { StatusEventsPage } from './status-events/status-events.page';
import { StatusEventItemsPage } from './status-event-items/status-event-items.page';
import { ActivityPubEventsPage } from './activity-pub-events/activity-pub-events.page';
import { ActivityPubEventItemsPage } from './activity-pub-event-items/activity-pub-event-items.page';

const routes: Routes = [
    { path: 'login', component: LoginPage, canActivate: [ loggedOutGuard ], title: 'common.pageTitles.login' },
    { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [ loggedOutGuard ], title: 'common.pageTitles.forgotPassword' },
    { path: 'login-callback', component: LoginCallbackPage, canActivate: [ loggedOutGuard ] },
    { path: 'reset-password', component: ResetPasswordPage, canActivate: [ loggedOutGuard ], title: 'common.pageTitles.resetPassword' },
    { path: 'register', component: RegisterPage, canActivate: [ loggedOutGuard ], title: 'common.pageTitles.register' },
    { path: 'confirm-email', component: ConfirmEmailPage, title: 'common.pageTitles.confirmEmail' },
    { path: 'account', component: AccountPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.account' },
    { path: 'home', component: HomePage, data: { reuse: true }, title: 'common.pageTitles.homeTimeline' },
    { path: 'access-forbidden', component: AccessForbiddenPage, title: 'common.pageTitles.accessForbidden' },
    { path: 'unexpected-error', component: UnexpectedErrorPage, title: 'common.pageTitles.unexpectedError' },
    { path: 'connection-lost', component: ConnectionLostPage, title: 'common.pageTitles.connectionLost' },
    { path: 'page-not-found', component: PageNotFoundPage, title: 'common.pageTitles.pageNotFound' },
    { path: 'upload', component: UploadPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.uploadImages' },
    { path: 'search', component: SearchPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.search' },
    { path: 'notifications', component: NotificationsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.notifications' },
    { path: 'invitations', component: InvitationsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.invitations' },
    { path: 'settings', component: SettingsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.settings' },
    { path: 'trending', component: TrendingPage, data: { reuse: true }, title: 'common.pageTitles.trending' },
    { path: 'editors', component: EditorsPage, data: { reuse: true }, title: 'common.pageTitles.editorsChoice' },
    { path: 'categories', component: CategoriesPage, data: { reuse: true }, title: 'common.pageTitles.categories' },
    { path: 'preferences', component: PreferencesPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.preferences' },
    { path: 'reports', component: ReportsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.reports' },
    { path: 'tags/:tag', component: HashtagPage, data: { reuse: true }, title: 'common.pageTitles.tags' },
    { path: 'categories/:category', component: CategoryPage, data: { reuse: true }, title: 'common.pageTitles.categories' },
    { path: 'support', component: SupportPage, title: 'common.pageTitles.support' },
    { path: 'terms', component: TermsPage, title: 'common.pageTitles.terms' },
    { path: 'privacy', component: PrivacyPage, title: 'common.pageTitles.privacy' },
    { path: 'bookmarks', component: BookmarksPage, data: { reuse: true }, title: 'common.pageTitles.bookmarks' },
    { path: 'favourites', component: FavouritesPage, data: { reuse: true }, title: 'common.pageTitles.favourites' },
    { path: 'users', component: UsersPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.users' },
    { path: 'articles', component: ArticlesPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.articles' },
    { path: 'articles/create', component: ArticleEditPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.createArticle' },
    { path: 'articles/:id', component: ArticleEditPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.editArticle' },
    { path: 'news', component: NewsPage, title: 'common.pageTitles.news' },
    { path: 'news/:id', component: NewsPreviewPage, title: 'common.pageTitles.news' },
    { path: 'faq', component: FrequentlyAskedQuestionsPage, title: 'common.pageTitles.frequentlyAskedQuestions' },
    { path: 'business-card/edit', component: EditBusinessCardPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.editUsersBusinessCard' },
    { path: 'shared-cards', component: SharedCardsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.sharedBusinessCards' },
    { path: 'shared-cards/:id', component: SharedCardPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.sharedBusinessCard' },
    { path: 'cards/:code', component: SharedCardPublicPage, title: 'common.pageTitles.sharedBusinessCard' },
    { path: 'error-items', component: ErrorItemsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.errors' },
    { path: 'activity-pub-events', component: ActivityPubEventsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.activityPubEvents'},
    { path: 'activity-pub-events/:eventId/items', component: ActivityPubEventItemsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.activityPubEventRecipients'},
    { path: 'actors/:userName', component: ProfilePage, data: { reuse: true }, children: [
        { path: 'posts', component: ProfilePage },
        { path: 'following', component: ProfilePage },
        { path: 'followers', component: ProfilePage }
    ]},
    { path: ':userName', component: ProfilePage, data: { reuse: true }, children: [
        { path: 'posts', component: ProfilePage },
        { path: 'following', component: ProfilePage },
        { path: 'followers', component: ProfilePage }
    ]},
    { path: ':userName/:id', component: StatusPage },
    { path: 'statuses/:id/edit', component: UploadPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.uploadImages' },
    { path: 'statuses/:id/events', component: StatusEventsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.statusEvents' },
    { path: 'statuses/:id/events/:eventId/items', component: StatusEventItemsPage, canActivate: [ authorizationGuard ], title: 'common.pageTitles.eventRecipients' },
    { path: 'statuses/:id', component: StatusPage },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundPage }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', enableViewTransitions: true })],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
