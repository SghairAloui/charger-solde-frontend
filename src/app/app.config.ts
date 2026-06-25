import {ApplicationConfig} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {NZ_ICONS} from 'ng-zorro-antd/icon';
import {
  MailOutline, LockOutline, UserOutline, BellOutline, DashboardOutline, ShopOutline, ShoppingOutline,
  OrderedListOutline, HistoryOutline, MessageOutline, FileExclamationOutline, SettingOutline,
  CheckCircleOutline, ClockCircleOutline, SyncOutline, LogoutOutline, MenuFoldOutline,
  MenuUnfoldOutline, StarOutline, FireOutline, PhoneOutline, InfoCircleOutline, PaperClipOutline,
  SendOutline, EditOutline, SaveOutline, KeyOutline, EyeOutline, EyeInvisibleOutline,
  ArrowLeftOutline, ArrowRightOutline, ArrowUpOutline, ArrowDownOutline,
  CustomerServiceOutline, PlusOutline, DownOutline, ThunderboltOutline, SafetyCertificateOutline,
  BarChartOutline, ExclamationCircleOutline, ExclamationCircleFill, CloseCircleFill, CheckCircleFill,
  TeamOutline, BuildOutline, GiftOutline, SearchOutline, CreditCardOutline, WalletOutline,
  CalendarOutline, InboxOutline, CloseOutline, CameraOutline,
  LoginOutline, MoreOutline, AlertOutline, HomeOutline, ReloadOutline, DeleteOutline,
  UploadOutline, DownloadOutline, FilterOutline, SortAscendingOutline, QuestionCircleOutline, CrownOutline,
  UserAddOutline, StopOutline, RiseOutline, FallOutline
} from '@ant-design/icons-angular/icons';

import {routes} from './app.routes';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {errorInterceptor} from './core/interceptors/error.interceptor';
import {NZ_I18N, fr_FR} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

const icons = [
  MailOutline, LockOutline, UserOutline, BellOutline, DashboardOutline, ShopOutline, ShoppingOutline,
  OrderedListOutline, HistoryOutline, MessageOutline, FileExclamationOutline, SettingOutline,
  CheckCircleOutline, ClockCircleOutline, SyncOutline, LogoutOutline, MenuFoldOutline,
  MenuUnfoldOutline, StarOutline, FireOutline, PhoneOutline, InfoCircleOutline, PaperClipOutline,
  SendOutline, EditOutline, SaveOutline, KeyOutline, EyeOutline, EyeInvisibleOutline,
  ArrowLeftOutline, ArrowRightOutline, ArrowUpOutline, ArrowDownOutline,
  CustomerServiceOutline, PlusOutline, DownOutline, ThunderboltOutline, SafetyCertificateOutline,
  BarChartOutline, ExclamationCircleOutline, ExclamationCircleFill, CloseCircleFill, CheckCircleFill,
  TeamOutline, BuildOutline, GiftOutline, SearchOutline, CreditCardOutline, WalletOutline,
  CalendarOutline, InboxOutline, CloseOutline, CameraOutline,
  LoginOutline, MoreOutline, AlertOutline, HomeOutline, ReloadOutline, DeleteOutline,
  UploadOutline, DownloadOutline, FilterOutline, SortAscendingOutline, QuestionCircleOutline, CrownOutline,
  UserAddOutline, StopOutline, RiseOutline, FallOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    {provide: NZ_ICONS, useValue: icons},
    {provide: NZ_I18N, useValue: fr_FR}
  ]
};