const { contextBridge } = require("electron");
// import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {});
