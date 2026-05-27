import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { AppProvider, useApp } from "../../../src/store/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prompt } from "../../../src/types";

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

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

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

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("should debounce multiple rapid state changes into single save", async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useApp(), { wrapper });

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    (AsyncStorage.setItem as jest.Mock).mockClear();

    await act(async () => {
      result.current.dispatch({
        type: "ADD_PROMPT",
        prompt: {
          id: "p1",
          title: "P1",
          content: "...",
          categoryId: "cat-1",
          tags: [],
          isFavorite: false,
          createdAt: 1,
          updatedAt: 2,
        },
      });
    });

    await act(async () => {
      result.current.dispatch({
        type: "ADD_PROMPT",
        prompt: {
          id: "p2",
          title: "P2",
          content: "...",
          categoryId: "cat-1",
          tags: [],
          isFavorite: false,
          createdAt: 3,
          updatedAt: 4,
        },
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    expect(setItemCalls.length).toBe(2);

    jest.useRealTimers();
  });

  it("should initialize with DEFAULT_CATEGORIES when stored categories are empty", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("system");

    const { result } = renderHook(() => useApp(), { wrapper });
    await waitForReady(result);

    expect(result.current.state.categories.length).toBeGreaterThan(0);
  });
});
