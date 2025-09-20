import { Para, Environment } from "@getpara/server-sdk";
import dotenv from "dotenv";

dotenv.config();

class ParaInstanceManager {
  static instance;
  paraServer;

  constructor() {
    const apiKey = process.env.PARA_API_KEY || '';
    
    if (!apiKey) {
      console.warn('⚠️ PARA_API_KEY not found in environment variables. Para Protocol integration may not work properly.');
    }
    
    this.paraServer = new Para(Environment.SANDBOX, apiKey);
    console.log(`✅ Para Protocol initialized with environment: ${Environment.SANDBOX}`);
  }

  static getInstance() {
    if (!ParaInstanceManager.instance) {
      ParaInstanceManager.instance = new ParaInstanceManager();
    }
    return ParaInstanceManager.instance;
  }

  getParaServer() {
    return this.paraServer;
  }

  setUserShare(userShare) {
    this.paraServer.setUserShare(userShare);
  }

  getUserShare() {
    return this.paraServer.getUserShare();
  }

  clearUserShare() {
    this.paraServer.setUserShare('');
  }

  hasUserShare() {
    const userShare = this.paraServer.getUserShare();
    return userShare !== null && userShare !== '';
  }

  getCurrentUserShare() {
    return this.paraServer.getUserShare();
  }
}

export default ParaInstanceManager;