import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function Auth({ children }) {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <div className="header">
            <h1>Secure File Vault</h1>
            <button onClick={signOut}>Sign out</button>
          </div>
          {children}
        </div>
      )}
    </Authenticator>
  );
}

export default Auth;