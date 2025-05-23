import React, { useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Visually hidden input using MUI styled
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

const ImageViewer: React.FC = () => {
  const [images, setImages] = React.useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json) || !json.every((s) => typeof s === "string"))
          throw new Error();
        setImages(json);
      } catch {
        alert("Nieprawidłowy plik JSON (lista stringów).");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleCopy = async (base64: string) => {
    try {
      await navigator.clipboard.writeText(base64);
    } catch {
      alert("Nie udało się skopiować do schowka.");
    }
  };

  return (
    <Stack width="100vw" alignItems="center" spacing={4} mt={4}>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
      >
        Wczytaj plik JSON ze zdjęciami
        <VisuallyHiddenInput
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </Button>
      <Stack spacing={4} width="100%">
        {images.map((base64, idx) => (
          <Card key={idx} sx={{ maxWidth: "60vw", mx: "auto" }}>
            <CardContent>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src={base64}
                  alt={`img-${idx}`}
                  style={{
                    width: "50vw",
                    height: "auto",
                    maxWidth: "100%",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleCopy(base64)}
                  size="small"
                >
                  Kopiuj base64 do schowka
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
        {images.length === 0 && (
          <Typography align="center" color="text.secondary">
            Wczytaj plik JSON zawierający listę zakodowanych zdjęć (base64).
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default ImageViewer;
