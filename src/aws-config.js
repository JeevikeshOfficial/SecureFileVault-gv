export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: '**********_********',
      userPoolClientId: '***********************',
      identityPoolId: '**********:****-****-****-****-************',
      loginWith: {
        email: true,
        username: true
      }
    }
  },
  Storage: {
    S3: {
      bucket: 'YOUR-BUCKET-NAME',
      region: 'BUCKET-REGION'
    }
  }
};
