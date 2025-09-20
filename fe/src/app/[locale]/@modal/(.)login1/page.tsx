import { Modal } from "@/components/Modal";
import React from "react";
import LoginForm from "../../admin-login/LoginForm";

const page = () => {
  return (
    <div className="flex flex-1 min-h-screen bg-[url('/login-background.png')] bg-contain bg-no-repeat bg-center justify-center">
      <Modal isOpen={false}>
        <LoginForm /> <p className="mt-6">Copyright @ Northern Tech 2024</p>
      </Modal>
    </div>
  );
};

export default page;
