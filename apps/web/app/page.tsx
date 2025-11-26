"use client";
import { type ImageProps } from "next/image";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { ProtectedComponent } from "../lib/auth";
import axios from "../lib/axios";
import { signOut } from "next-auth/react";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

export default function Home() {
  const [text, setText] = useState("noch kein Content");

  const getUser = async () => {
    axios
      .get("/user/abc")
      .then((res) =>
        setText(
          res ? "User gefunden: " + res.data.name : "User existiert nicht"
        )
      )
      .catch((err) => console.error(err));
  };

  const createUser = async () => {
    axios
      .post("/user", {
        id: "abc",
        name: "Tom",
        passwordHash: "hashedpassword",
        roleId: "user",
      })
      .then((res) => setText("Neuer User: " + res.data.name))
      .catch((err) => {
        setText("Fehler beim Erstellen des Users -- User existiert bereits");
        console.error(err);
      });
  };

  const deleteUser = async () => {
    axios
      .delete("/user/abc")
      .then((res) => setText("User gelöscht: " + res.data.name))
      .catch((err) => {
        setText("Fehler beim Löschen des Users -- User nicht gefunden");
        console.error(err);
      });
  };

  return (
    <ProtectedComponent>
      <div className="h-screen w-screen bg-gray-100 dark:bg-gray-900">
        <main className="h-full w-full flex flex-col items-center justify-center gap-4 p-4">
          <div className="flex gap-4">
            <Button variant="default" onClick={getUser}>
              Get User
            </Button>
            <Button onClick={createUser}>Create User</Button>
            <Button onClick={deleteUser}>Delete User</Button>
            <Button onClick={() => signOut()}>Logout</Button>
          </div>
          <p>{text}</p>
        </main>
      </div>
    </ProtectedComponent>
  );
}
