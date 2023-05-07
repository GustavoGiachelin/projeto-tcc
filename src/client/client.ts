// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Database, getDatabase, ref, set } from "firebase/database";
import { Guid } from "guid-typescript";

const firebaseConfig = {
  apiKey: "AIzaSyAH4sruJ8BwmiM5gcsjGETIIc7G4BDoF6g",
  authDomain: "projetotcc-315f3.firebaseapp.com",
  databaseURL: "https://projetotcc-315f3-default-rtdb.firebaseio.com",
  projectId: "projetotcc-315f3",
  storageBucket: "projetotcc-315f3.appspot.com",
  messagingSenderId: "673549335270",
  appId: "1:673549335270:web:743840c7d1f062a5469927",
  measurementId: "G-DL58GF0ECD"
};

export default class Client {
    private _db: Database
    constructor() {
        const app = initializeApp(firebaseConfig);
        this._db = getDatabase(app)
    }

    public save(model: DataModel): void {
        const guid = Guid.create()
        set(ref(this._db, 'timer/'+guid), model)
    }
}

/**
 * Estrutura dos dados que serão salvos no banco.
 * Representa o tempo que o usuário levou para concluir cada um dos labirintos.
 * Tempo representado em segundos.
 */
export type DataModel = {
    kruskalTime: number
    rbTime: number
    hnkTime: number
}