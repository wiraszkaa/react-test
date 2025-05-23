import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: number[];
  img?: string;
};

interface TestViewerProps {
  questions: Question[];
}

const TestViewer: React.FC<TestViewerProps> = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return (
      <Typography align="center" color="text.secondary" mt={4}>
        Brak załadowanych pytań.
      </Typography>
    );
  }

  // Sort questions by id (string comparison)
  const sortedQuestions = [...questions].sort((a, b) => {
    const getNum = (id: string) => {
      const parts = id.split("-");
      return parts.length > 1 ? parseInt(parts[1], 10) : 0;
    };
    return getNum(a.id) - getNum(b.id);
  });

  return (
    <Box width="100%" maxWidth={700} mt={4}>
      <List>
        {sortedQuestions.map((q, idx) => (
          <React.Fragment key={q.id || idx}>
            <ListItem alignItems="flex-start">
              <Card sx={{ width: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pytanie {idx + 1}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {q.question}
                  </Typography>
                  {q.img && (
                    <Box mb={2} display="flex" justifyContent="center">
                      <img
                        src={q.img}
                        alt={`img-${idx}`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 150,
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  )}
                  <List dense>
                    {q.options.map((opt, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemText
                          primary={opt}
                          primaryTypographyProps={{
                            fontWeight: q.answer.includes(i)
                              ? "bold"
                              : "normal",
                            color: q.answer.includes(i)
                              ? "success.main"
                              : undefined,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </ListItem>
            {idx < sortedQuestions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default TestViewer;
