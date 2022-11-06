import React from "react";
import LoginForm from '../components/User/LoginForm';

export default function Login() {

  return (
    <div className="login-page">
      <LoginForm // TODO: Update with actual getInfo callback after implementing state management system
        submitCallback={() => {}}
      />
    </div>
  );

};
