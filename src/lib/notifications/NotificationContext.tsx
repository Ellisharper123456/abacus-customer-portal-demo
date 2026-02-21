"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type NotificationAudience = "all" | "heat-pump" | "solar-battery";

export interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  createdAt: Date;
  ctaLabel?: string;
}

export interface NotificationInterest {
  id: string;
  notificationId: string;
  userId: string;
  companyId: string;
  createdAt: Date;
}

interface NotificationContextValue {
  notifications: NotificationMessage[];
  dismissedIds: string[];
  interests: NotificationInterest[];
  createNotification: (input: {
    title: string;
    body: string;
    audience: NotificationAudience;
    ctaLabel?: string;
  }) => void;
  dismissNotification: (id: string) => void;
  registerInterest: (notificationId: string, userId: string, companyId: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [interests, setInterests] = useState<NotificationInterest[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("abacus-notifications-state");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          notifications?: NotificationMessage[];
          dismissedIds?: string[];
          interests?: NotificationInterest[];
        };
        setNotifications(
          (parsed.notifications || []).map((n) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
        setDismissedIds(parsed.dismissedIds || []);
        setInterests(
          (parsed.interests || []).map((i) => ({
            ...i,
            createdAt: new Date(i.createdAt),
          }))
        );
      }
    } catch {
      // ignore parse errors in demo
    }
  }, []);

  const createNotification: NotificationContextValue["createNotification"] = (
    input
  ) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: input.title,
        body: input.body,
        audience: input.audience,
        ctaLabel: input.ctaLabel,
        createdAt: new Date(),
      },
      ...prev,
    ]);
  };

  const dismissNotification: NotificationContextValue["dismissNotification"] = (
    id
  ) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const registerInterest: NotificationContextValue["registerInterest"] = (
    notificationId,
    userId,
    companyId
  ) => {
    setInterests((prev) => [
      ...prev,
      {
        id: `interest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        notificationId,
        userId,
        companyId,
        createdAt: new Date(),
      },
    ]);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ notifications, dismissedIds, interests });
    window.localStorage.setItem("abacus-notifications-state", payload);
  }, [notifications, dismissedIds, interests]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        dismissedIds,
        interests,
        createNotification,
        dismissNotification,
        registerInterest,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
