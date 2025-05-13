import * as React from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

/**
 * Toast context for managing toast notifications
 */
const ToastContext = React.createContext({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
  update: () => {},
});

function toastReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

/**
 * ToastProvider component for providing toast context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Children components
 */
function ToastProvider({ children }) {
  const [state, dispatch] = React.useReducer(toastReducer, {
    toasts: [],
  });

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open && !toastTimeouts.has(toast.id) && toast.duration !== Infinity) {
        const timeout = setTimeout(() => {
          dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id });
          toastTimeouts.delete(toast.id);
        }, toast.duration || TOAST_REMOVE_DELAY);
        toastTimeouts.set(toast.id, timeout);
      }
    });
  }, [state.toasts]);

  const toast = React.useCallback(({ ...props }) => {
    const id = genId();

    const update = (props) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      });

    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      dismiss,
      update,
    };
  }, []);

  const update = React.useCallback((id, props) => {
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });
  }, []);

  const dismiss = React.useCallback((toastId) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch({ type: actionTypes.DISMISS_TOAST });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts: state.toasts,
        toast,
        dismiss,
        update,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast hook for using toast notifications
 * @returns {Object} Toast functions and state
 */
function useToast() {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

export { ToastProvider, useToast };
