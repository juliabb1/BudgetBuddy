"use client"
import { type ImageProps } from "next/image";
import styles from "./page.module.css";
import axios from "@web/lib/axios";
import { useState } from "react";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

export default function Home() {
  const [text, setText] = useState("noch kein Content")

  const getUser = async () => {
    axios.get("/user/abc")
      .then(res => setText(res ? "User gefunden: " + res.data.name : "User existiert nicht"))
      .catch(err => console.error(err));
  };

  const createUser = async () => {
    axios.post("/user", { id: "abc", name: "Tom", passwordHash: "hashedpassword", roleId: "user" })
      .then(res => setText("Neuer User: " + res.data.name))
      .catch(err => {
        setText("Fehler beim Erstellen des Users -- User existiert bereits");
        console.error(err)
      });
  };

  const deleteUser = async () => {
    axios.delete("/user/abc")
      .then(res => setText("User gelöscht: " + res.data.name))
      .catch(err => {
        setText("Fehler beim Löschen des Users -- User nicht gefunden");
        console.error(err)
      });
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={getUser}
          >
            Get User
          </button>
          <button
            onClick={createUser}
          >
            Create User
          </button>
          <button
            onClick={deleteUser}
          >
            Delete User
          </button>
        </div>
        <p>{text}</p>
      </main>
    </div>
  );
}
