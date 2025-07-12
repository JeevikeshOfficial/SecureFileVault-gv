export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_je8DiVCvL',
      userPoolClientId: '63d4vusd967v6iueug26974e3p',
      identityPoolId: 'ap-south-1:f8daa265-0d2c-4991-8280-cb645457077e',
      loginWith: {
        email: true,
        username: true
      }
    }
  },
  Storage: {
    S3: {
      bucket: 'securefilevault',
      region: 'ap-south-1'
    }
  }
};
