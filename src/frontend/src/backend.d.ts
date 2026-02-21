import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SessionState {
    session_id: string;
    user_id: Principal;
    timestamp: bigint;
    finalRootHash: string;
}
export interface Investment {
    id: string;
    txnIdText?: string;
    mode: string;
    name: string;
    eProject?: string;
    description: string;
    created_at: bigint;
    txnIdNat: bigint;
    investor: Principal;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Transaction {
    id: string;
    transaction_type: TransactionType;
    session_seq: bigint;
    txnIdText?: string;
    mode: string;
    txn_hash: string;
    investment_id: string;
    investor_id: Principal;
    nonce: string;
    timestamp: bigint;
    txnIdNat: bigint;
    amount: bigint;
}
export enum TransactionType {
    returnFunds = "returnFunds",
    withdraw = "withdraw",
    arbitration = "arbitration",
    instantBuy = "instantBuy",
    recharge = "recharge",
    instantBuyReturn = "instantBuyReturn",
    invest = "invest",
    payout = "payout"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createInvestment(id: string, name: string, description: string, eProject: string | null, mode: string, txnIdNat: bigint, txnIdText: string | null): Promise<void>;
    createTransaction(id: string, investment_id: string, amount: bigint, transaction_type: TransactionType, txn_hash: string, sessionId: string, mode: string, txnIdNat: bigint, txnIdText: string | null): Promise<void>;
    getAllInvestments(): Promise<Array<Investment>>;
    getAllSessionStates(): Promise<Array<SessionState>>;
    getCallerTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInvestment(id: string): Promise<Investment | null>;
    getInvestmentList(p: Principal): Promise<Array<Investment>>;
    getInvestmentTransactions(investment_id: string): Promise<Array<Transaction>>;
    getInvestorTransactions(investor_id: Principal): Promise<Array<Transaction>>;
    getLatestSessionHashes(): Promise<SessionState | null>;
    getSessionIdReturn(arg0: null): Promise<string | null>;
    getSessionState(session_id: string): Promise<SessionState | null>;
    getSessionTxnHashes(): Promise<Array<string>>;
    getTransaction(id: string): Promise<Transaction | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSessionIdReturn(id: string, nonce: string): Promise<void>;
    updateLatestSessionHashes(sessionState: SessionState): Promise<void>;
}
