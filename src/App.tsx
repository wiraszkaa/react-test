import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Stack,
  styled,
  AppBar,
  Toolbar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useRef, useState as useReactState } from "react";
import TestViewer from "./TestViewer";

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: number[];
  img?: string; // optional image field
};

function shuffle<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Shuffle questions and their options, updating answer indices accordingly
function shuffleQuestions(questions: Question[]): Question[] {
  return shuffle(questions).map((q) => {
    const optionPairs = q.options.map((opt, idx) => ({ opt, idx }));
    const shuffledPairs = shuffle(optionPairs);
    const newOptions = shuffledPairs.map((pair) => pair.opt);
    const newAnswer = q.answer
      .map((ansIdx) => shuffledPairs.findIndex((pair) => pair.idx === ansIdx))
      .filter((idx) => idx !== -1);
    return {
      ...q,
      options: newOptions,
      answer: newAnswer,
    };
  });
}

let quotaAlertShown = false;

function safeSetLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      !quotaAlertShown
    ) {
      quotaAlertShown = true;
      alert(
        "Nie można zapisać sesji: przekroczono limit pamięci przeglądarki."
      );
    }
    // Optionally: log or handle other errors
  }
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const STORAGE_KEY = "testownik-state-v1";

function App() {
  const [testViewer, setTestViewer] = useState(false);

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [loadDialogOpen, setLoadDialogOpen] = useReactState(false);
  const [fileQuestions, setFileQuestions] = useReactState<Question[] | null>(
    null
  );
  const [numToLoad, setNumToLoad] = useReactState<number>(10);
  const [startIndex, setStartIndex] = useReactState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a loading state for default questions
  const [loadingDefault, setLoadingDefault] = useReactState(false);

  // Helper to fetch and set default questions
  const fetchDefaultQuestions = async () => {
    setLoadingDefault(true);
    try {
      const res = await fetch("/questions/unique.json");
      if (!res.ok) throw new Error("Błąd pobierania pytań");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error();
      const shuffled = shuffleQuestions(data);
      setQuestions(shuffled);
      setCurrent(0);
      setSelected(null);
      setShowAnswer(false);
      setCorrectAnswers([]);
      safeSetLocalStorage(
        STORAGE_KEY,
        JSON.stringify({
          questions: shuffled,
          current: 0,
          selected: null,
          showAnswer: false,
          correctAnswers: [],
        })
      );
    } catch {
      alert("Nie udało się pobrać domyślnego testu.");
    } finally {
      setLoadingDefault(false);
    }
  };

  // Load state from localStorage on mount, otherwise fetch default questions
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQuestions(parsed.questions);
        setCurrent(parsed.current);
        setSelected(parsed.selected);
        setShowAnswer(parsed.showAnswer);
        setCorrectAnswers(parsed.correctAnswers);
        return;
      } catch {
        // ignore corrupted state
      }
    }
    // If no saved session, fetch default questions
    fetchDefaultQuestions();
    // eslint-disable-next-line
  }, []);

  // Save state to localStorage on every change
  useEffect(() => {
    if (questions) {
      safeSetLocalStorage(
        STORAGE_KEY,
        JSON.stringify({
          questions,
          current,
          selected,
          showAnswer,
          correctAnswers,
        })
      );
    }
  }, [questions, current, selected, showAnswer, correctAnswers]);

  // Modified handleFileChange to open dialog for options
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json) || json.length === 0) throw new Error();
        setFileQuestions(json);
        setNumToLoad(json.length);
        setStartIndex(0);
        setLoadDialogOpen(true);
      } catch {
        alert("Nieprawidłowy plik JSON.");
      }
    };
    reader.readAsText(file);
    // Reset input so user can upload the same file again if needed
    if (e.target) e.target.value = "";
  };

  // Confirm loading questions with user options
  const handleConfirmLoad = () => {
    if (!fileQuestions) return;
    const start = Math.max(0, Math.min(startIndex, fileQuestions.length - 1));
    const end = Math.max(
      start,
      Math.min(start + numToLoad, fileQuestions.length)
    );
    const selectedQuestions = fileQuestions.slice(start, end);
    const shuffled = shuffleQuestions(selectedQuestions);
    setQuestions(shuffled);
    setCurrent(0);
    setSelected(null);
    setShowAnswer(false);
    setCorrectAnswers([]);
    setLoadDialogOpen(false);
    setFileQuestions(null);
    safeSetLocalStorage(
      STORAGE_KEY,
      JSON.stringify({
        questions: shuffled,
        current: 0,
        selected: null,
        showAnswer: false,
        correctAnswers: [],
      })
    );
  };

  const handleAnswer = () => {
    if (selected === null) return;
    if (q.answer.includes(selected)) {
      setCorrectAnswers((prev) => [...prev, current]);
      setShowAnswer(false);
      setSelected(null);
      setCurrent((c) => c + 1);
    } else {
      setShowAnswer(true);
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelected(null);
    setCurrent((c) => c + 1);
  };

  const handleRestart = () => {
    if (questions) {
      const shuffled = shuffleQuestions(questions);
      setQuestions(shuffled);
      setCurrent(0);
      setSelected(null);
      setShowAnswer(false);
      setCorrectAnswers([]);
      safeSetLocalStorage(
        STORAGE_KEY,
        JSON.stringify({
          questions: shuffled,
          current: 0,
          selected: null,
          showAnswer: false,
          correctAnswers: [],
        })
      );
    }
  };

  // --- Navigation Bar ---
  const NavBar = (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Testownik
        </Typography>
        <Button color="inherit" onClick={() => setTestViewer((prev) => !prev)}>
          {testViewer ? "Po kolei" : "Cały test"}
        </Button>
        <Button color="inherit" onClick={handleRestart} disabled={!questions}>
          Restartuj test
        </Button>
        <Button
          color="inherit"
          onClick={fetchDefaultQuestions}
          disabled={loadingDefault}
        >
          Domyślny test
        </Button>
        <Button
          color="inherit"
          component="label"
          startIcon={<CloudUploadIcon />}
        >
          Wczytaj pytania
          <VisuallyHiddenInput
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
        </Button>
      </Toolbar>
    </AppBar>
  );

  // --- Load Dialog ---
  // Place this just before return
  const LoadDialog =
    loadDialogOpen && fileQuestions ? (
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
        zIndex={1300}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(0,0,0,0.3)"
      >
        <Card sx={{ minWidth: 320, p: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Wybierz zakres pytań do załadowania
            </Typography>
            <Box mb={2}>
              <Typography variant="body2">
                Liczba pytań w pliku: {fileQuestions.length}
              </Typography>
            </Box>
            <Box mb={2}>
              <FormControl fullWidth>
                <FormLabel>Indeks pierwszego pytania (od 0)</FormLabel>
                <input
                  type="number"
                  min={0}
                  max={fileQuestions.length - 1}
                  value={startIndex}
                  onChange={(e) => setStartIndex(Number(e.target.value))}
                  style={{ width: "100%", padding: 8, fontSize: 16 }}
                />
              </FormControl>
            </Box>
            <Box mb={2}>
              <FormControl fullWidth>
                <FormLabel>Liczba pytań do załadowania</FormLabel>
                <input
                  type="number"
                  min={1}
                  max={fileQuestions.length - startIndex}
                  value={numToLoad}
                  onChange={(e) => setNumToLoad(Number(e.target.value))}
                  style={{ width: "100%", padding: 8, fontSize: 16 }}
                />
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="contained"
                onClick={handleConfirmLoad}
                disabled={
                  startIndex < 0 ||
                  startIndex >= fileQuestions.length ||
                  numToLoad < 1 ||
                  startIndex + numToLoad > fileQuestions.length
                }
              >
                Załaduj
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setLoadDialogOpen(false);
                  setFileQuestions(null);
                }}
              >
                Anuluj
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    ) : null;

  if (testViewer && questions) {
    return (
      <Stack
        width="100vw"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
      >
        {NavBar}
        {LoadDialog}
        <Stack flexGrow={1} justifyContent="center" alignItems="center">
          <TestViewer questions={questions} />
        </Stack>
      </Stack>
    );
  }

  // --- Main Content ---
  if (!questions) {
    return (
      <Stack
        width="100vw"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        {NavBar}
        {LoadDialog}
        <Stack flexGrow={1} justifyContent="center" alignItems="center">
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Wczytaj pytania aby rozpocząć test
            </Typography>
          </Box>
        </Stack>
      </Stack>
    );
  }

  const q = questions[current];

  if (current >= questions.length) {
    return (
      <Stack
        width="100vw"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        {NavBar}
        {LoadDialog}
        <Stack flexGrow={1} justifyContent="center" alignItems="center">
          <Box mt={4} textAlign="center">
            <Typography variant="h4">Koniec testu!</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Twój wynik: {correctAnswers.length} / {questions.length}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack width="100vw" height="100vh" alignItems="center">
      {NavBar}
      {LoadDialog}
      <Stack flexGrow={1} justifyContent="center" alignItems="center">
        <h1>Test</h1>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Pytanie {current + 1} z {questions.length}
        </Typography>
        <Box display="flex" justifyContent="center" mt={4}>
          <Card sx={{ minWidth: 400 }}>
            <CardContent>
              {q.img && (
                <Box mb={2} display="flex" justifyContent="center">
                  <img
                    src={q.img}
                    alt="question"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}
              <Typography variant="h6" gutterBottom>
                {q.question}
              </Typography>
              <FormControl component="fieldset">
                <FormLabel component="legend">Wybierz odpowiedź:</FormLabel>
                <RadioGroup
                  value={selected}
                  onChange={(_, v) => setSelected(Number(v))}
                >
                  {q.options.map((opt, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={idx}
                      control={<Radio />}
                      label={opt}
                      disabled={showAnswer}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <Box mt={2}>
                <Button
                  variant="contained"
                  onClick={handleAnswer}
                  disabled={selected === null || showAnswer}
                >
                  Zatwierdź
                </Button>
                {showAnswer && (
                  <Button
                    variant="outlined"
                    sx={{ ml: 2 }}
                    onClick={handleNext}
                  >
                    Następne pytanie
                  </Button>
                )}
              </Box>
              {showAnswer && (
                <>
                  {q.answer.includes(selected!) ? (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Prawidłowa odpowiedź:{" "}
                      <strong>{q.options[q.answer[0]]}</strong>
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Prawidłowa odpowiedź:{" "}
                      <strong>{q.options[q.answer[0]]}</strong>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Stack>
  );
}

export default App;
