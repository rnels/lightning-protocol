import React from "react";
import RegisterForm from "../components/User/RegisterForm";

export default function Register() {

  return (
    <div className="register-page">
      <RegisterForm // TODO: Update with actual getInfo callback after implementing state management system
        submitCallback={() => {}}
      />
    </div>
  );

};
