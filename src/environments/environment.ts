export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  wsUrl: 'ws://localhost:8081/ws',
  appName: 'Rassidi',
  appVersion: '1.0.0',
  tokenKey: 'tunitopup_token',
  refreshTokenKey: 'tunitopup_refresh',
  userKey: 'tunitopup_user',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50]
  },
  upload: {
    maxFileSize: 2 * 1024 * 1024,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.gif']
  }
};
