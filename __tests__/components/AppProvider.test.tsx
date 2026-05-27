import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { AppProvider, useApp } from "../../src/store/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prompt } from "../../src/types";

beforeEach(() => {
  (AsyncStorage as any).__reset();
  (AsyncStorage.getItem as jest.Mock)
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null);
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

/** Wait until initial data load completes */
async function waitForReady(result: any) {
  await waitFor(() => {
    expect(result.current.state.isLoading).toBe(false);
  });
}

describe("AppProvider", () => {
  it("should throw error when useApp is used outside AppProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useApp());
    }).toThrow("useApp must be used within AppProvider");

    spy.mockRestore();
  });

  it("should start with isLoading true and empty state", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.state.isLoading).toBe(true);
    expect(result.current.state.prompts).toEqual([]);
    expect(result.current.state.categories).toEqual([]);
    expect(result.current.state.themeMode).toBe("system");
  });

  it("should eventually finish loading", async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    await waitForReady(result);
    expect(result.current.state.isLoading).toBe(false);
  });

  it("should dispatch ADD_PROMPT and update state", async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    await waitForReady(result);

    const newPrompt: Prompt = {
      id: "test-1",
      title: "Test",
      content: "Content",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt: newPrompt });
    });

    expect(result.current.state.prompts).toHaveLength(1);
    expect(result.current.state.prompts[0].title).toBe("Test");
  });

  it("should dispatch DELETE_PROMPT and remove from state", async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    await waitForReady(result);

    const prompt: Prompt = {
      id: "del-me",
      title: "Delete me",
      content: "...",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt });
    });
    expect(result.current.state.prompts).toHaveLength(1);

    await act(async () => {
      result.current.dispatch({ type: "DELETE_PROMPT", id: "del-me" });
    });
    expect(result.current.state.prompts).toHaveLength(0);
  });

  it("should dispatch TOGGLE_FAVORITE and flip isFavorite", async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    await waitForReady(result);

    const prompt: Prompt = {
      id: "fav-1",
      title: "Star me",
      content: "...",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt });
    });

    await act(async () => {
      result.current.dispatch({ type: "TOGGLE_FAVORITE", id: "fav-1" });
    });
    expect(result.current.state.prompts[0].isFavorite).toBe(true);

    await act(async () => {
      result.current.dispatch({ type: "TOGGLE_FAVORITE", id: "fav-1" });
    });
    expect(result.current.state.prompts[0].isFavorite).toBe(false);
  });

  it("should dispatch SET_THEME_MODE and change themeMode", async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    await waitForReady(result);

    await act(async () => {
      result.current.dispatch({
        type: "SET_THEME_MODE",
        themeMode: "dark",
      });
    });

    expect(result.current.state.themeMode).toBe("dark");
  });

  it("should debounce saveData by 300ms after state change", async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useApp(), { wrapper });

    // Flush initial load effects and timers
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Clear mock call history after initial load
    (AsyncStorage.setItem as jest.Mock).mockClear();

    const prompt: Prompt = {
      id: "save-test",
      title: "Save test",
      content: "...",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt });
    });

    // saveData should NOT have been called yet (debounce pending)
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    // Advance past 300ms debounce
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Now saveData should have been called
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
