export const APP = {
  NAME: 'WAHA NET',
  SHORT_NAME: 'WAHA NET',
  VERSION: '1.0.0',
  COMPANY: 'WAHA NET Solutions',
  SUPPORT_EMAIL: 'support@tunitopup.tn',
  SUPPORT_PHONE: '+216 XX XXX XXX'
};

export const ROUTES = {
  AUTH: {
    LOGIN: 'auth/login',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password'
  },
  ADMIN: {
    ROOT: 'admin',
    DASHBOARD: 'dashboard',
    CLIENTS: 'clients',
    OPERATORS: 'operators',
    OFFERS: 'offers',
    ORDERS: 'orders',
    NOTIFICATIONS: 'notifications',
    MESSAGING: 'messaging',
    CLAIMS: 'claims'
  },
  CLIENT: {
    ROOT: 'client',
    DASHBOARD: 'dashboard',
    STORE: 'store',
    ORDERS: 'orders',
    HISTORY: 'history',
    MESSAGING: 'messaging',
    CLAIMS: 'claims',
    PROFILE: 'profile'
  }
};

export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VALIDATE_RESET_CODE: '/auth/validate-reset-code',
    SIGNUP: '/auth/signup',
  },
  ADMIN: {
    CLIENTS: '/admin/clients',
    CLIENT_STATUS: (id: number) => `/admin/clients/${id}/status`,
    CLIENT_RECHARGE_SUMMARY: '/admin/clients/recharge-summary',
    OPERATORS: '/admin/operators',
    PLANS: '/admin/plans',
    RECHARGE: '/admin/recharge',
    DASHBOARD: '/admin',
    ALERTS: '/admin/alerts',
    ALERT_DISABLE: (id: number) => `/admin/alerts/${id}/disable`,
    BALANCE: (id: number) => `/admin/clients/${id}/balance`,

    PAY: (id: number) => `/admin/clients/${id}/pay`,
  },
  CLIENT: {
    RECHARGE: '/client/recharge',
    RECHARGES: '/client/recharges',
    ALERTS: '/client/alerts'

  },
  OPERATORS: {
    BASE: '/operators',
    PLANS: (id: number) => `/operators/${id}/plans`
  },
  PROFILE: {
    BASE: '/profile',
    PASSWORD: '/profile/password',
    PHOTO: '/profile/photo'
  },
  CLAIMS: {
    BASE: '/claims',
    MY: '/claims/my',
    STATUS: (id: number) => `/claims/${id}/status`
  },
  MESSAGES: {
    BASE: '/messages',
    CONVERSATION: (userId: number) => `/messages/conversation/${userId}`
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all'
  }
};

export const STORAGE = {
  TOKEN: 'tunitopup_token',
  USER: 'tunitopup_user',
  THEME: 'tunitopup_theme'
};

export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
    RESET_LINK_SENT: 'Un lien de réinitialisation a été envoyé à votre adresse email',
    SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter'
  },
  ERRORS: {
    NETWORK: 'Erreur de connexion. Veuillez vérifier votre réseau',
    SERVER: 'Erreur serveur. Veuillez réessayer plus tard',
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
    NOT_FOUND: 'Ressource introuvable',
    VALIDATION: 'Veuillez vérifier les champs du formulaire'
  },
  RECHARGE: {
    SUCCESS: 'Demande de recharge créée avec succès',
    CONFIRMED: 'Recharge confirmée',
    REJECTED: 'Recharge rejetée'
  }
};

