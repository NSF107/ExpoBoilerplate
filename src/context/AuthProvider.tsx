import { Session, User } from "@supabase/supabase-js";
import React, { useContext, createContext, useState, useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";

interface AuthProviderProps {
    children: React.ReactNode;
}

type AuthContextType = {
    session: Session | null;
    user: User | null;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
});

const AuthProvider = (props: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user || null);
                setLoading(false);
            },
        );

        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error) {
                throw error;
            }

            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
        };

        setData();

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
