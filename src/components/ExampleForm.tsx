'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from '@mui/material';

// 폼 데이터 타입 정의
interface ExampleFormData {
  title: string;
  description: string;
  email: string;
}

interface ExampleFormProps {
  onSubmit?: (data: ExampleFormData) => void;
}

export default function ExampleForm({ onSubmit }: ExampleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExampleFormData>({
    defaultValues: {
      title: '',
      description: '',
      email: '',
    },
  });

  const handleFormSubmit: SubmitHandler<ExampleFormData> = async (data) => {
    // 폼 제출 처리
    console.log('Form submitted:', data);
    onSubmit?.(data);
    reset();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Example Form
      </Typography>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Title"
            fullWidth
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters',
              },
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            {...register('description', {
              required: 'Description is required',
              maxLength: {
                value: 500,
                message: 'Description must be less than 500 characters',
              },
            })}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
