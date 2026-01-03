'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card as MuiCard,
  CardContent,
  Chip,
  Skeleton,
  Autocomplete,
  Tooltip,
  Popover,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIconOutlined from '@mui/icons-material/CloseOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import {
  getPatterns,
  getPatternsPaginated,
  getPatternStats,
  createPattern,
  deletePattern,
  updatePattern,
} from '@/lib/supabase/patterns';
import type { Pattern, CreatePatternData } from '@/types/pattern';

/**
 * 태그 툴팁 컴포넌트
 * + 아이콘에 hover하면 나머지 태그를 보여줍니다
 */
function TagTooltip({ tags }: { tags: string[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip
        title={`+${tags.length}개 더 보기`}
        arrow
        placement="top"
      >
        <IconButton
          size="small"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          sx={{
            width: '20px',
            height: '20px',
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
            },
          }}
        >
          <MoreHorizIcon sx={{ fontSize: '0.875rem' }} />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
        }}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <Box sx={{ p: 1.5, maxWidth: 200 }}>
          <Typography variant="caption" sx={{ opacity: 0.7, mb: 1, display: 'block' }}>
            추가 태그 ({tags.length}개)
          </Typography>
          <Stack spacing={0.5}>
            {tags.map((tag: string, idx: number) => (
              <Chip
                key={idx}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

/**
 * Patterns 페이지
 *
 * 패턴 목록 확인, 패턴 추가, 패턴 복습 기능 제공
 */
export default function PatternsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const ensureTagsArray = (tags: unknown): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const currentPageRef = useRef(0);
  const loadedOffsetRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    incomplete: number;
    completed: number;
  }>({
    total: 0,
    incomplete: 0,
    completed: 0,
  });
  const INITIAL_PAGE_SIZE = 6;
  const PAGE_SIZE = 3;
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [currentReviewPattern, setCurrentReviewPattern] = useState<Pattern | null>(null);
  const [reviewPatterns, setReviewPatterns] = useState<Pattern[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [showAnswer, setShowAnswer] = useState(false);

  // 패턴 편집 상태
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editPatternData, setEditPatternData] = useState<{ pattern_ko: string; pattern_en: string; examples: string[] }>({
    pattern_ko: '',
    pattern_en: '',
    examples: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // 패턴 추가 폼 상태
  const [newPattern, setNewPattern] = useState<CreatePatternData>({
    pattern_ko: '',
    pattern_en: '',
    examples: [],
    tags: [],
  });
  const [newPatternTags, setNewPatternTags] = useState<string[]>([]);
  const [newPatternExamples, setNewPatternExamples] = useState<string[]>([]);
  const [newExampleValue, setNewExampleValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [addingTagPatternId, setAddingTagPatternId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState<string>('');

  const [openTagReviewDialog, setOpenTagReviewDialog] = useState(false);
  const [selectedReviewTag, setSelectedReviewTag] = useState<string | null>(null);

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    patternId: string | null;
  }>({
    open: false,
    patternId: null,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      loadPatterns(true);
      loadStats();
    }
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (patterns.length > 0) {
      const tags = new Set<string>();
      patterns.forEach((pattern) => {
        const patternTags = ensureTagsArray(pattern.tags);
        if (patternTags.length > 0) {
          patternTags.forEach((tag) => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags).sort());
    }
  }, [patterns]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const patternStats = await getPatternStats(user.id);
      setStats(patternStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadPatterns = useCallback(
    async (reset: boolean = false) => {
      if (!user?.id) return;

      try {
        if (reset) {
          setIsLoading(true);
          setCurrentPage(0);
          currentPageRef.current = 0;
          setPatterns([]);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        let page: number;
        let pageSize: number;

        if (reset) {
          page = 0;
          pageSize = INITIAL_PAGE_SIZE;
        } else {
          const currentOffset = loadedOffsetRef.current;
          page = Math.floor(currentOffset / PAGE_SIZE);
          pageSize = PAGE_SIZE;
        }

        const { patterns: newPatterns, hasMore: more } = await getPatternsPaginated(
          user.id,
          page,
          pageSize
        );

        if (reset) {
          setPatterns(newPatterns);
          setCurrentPage(INITIAL_PAGE_SIZE / PAGE_SIZE);
          currentPageRef.current = INITIAL_PAGE_SIZE / PAGE_SIZE;
          loadedOffsetRef.current = INITIAL_PAGE_SIZE;
        } else {
          setPatterns((prev) => {
            const existingIds = new Set(prev.map((pattern) => pattern.id));
            const uniqueNewPatterns = newPatterns.filter((pattern) => !existingIds.has(pattern.id));
            return [...prev, ...uniqueNewPatterns];
          });
          const nextPage = currentPageRef.current + 1;
          setCurrentPage(nextPage);
          currentPageRef.current = nextPage;
          loadedOffsetRef.current += newPatterns.length;
        }
        setHasMore(more);
      } catch (err) {
        setError(err instanceof Error ? err.message : '패턴을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user?.id, INITIAL_PAGE_SIZE, PAGE_SIZE]
  );

  const observerTargetRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || !user?.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isFetchingRef.current && hasMore) {
          isFetchingRef.current = true;
          loadPatterns(false).finally(() => {
            isFetchingRef.current = false;
          });
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    const target = observerTargetRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, loadPatterns, user?.id]);

  const handleAddPattern = async () => {
    if (!user?.id) return;

    if (!newPattern.pattern_ko.trim() || !newPattern.pattern_en.trim()) {
      setError('한국어와 영어 패턴을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const createdPattern = await createPattern(user.id, {
        pattern_ko: newPattern.pattern_ko.trim(),
        pattern_en: newPattern.pattern_en.trim(),
        examples: newPatternExamples.filter((ex) => ex.trim() !== ''),
        tags: newPatternTags.filter((tag) => tag.trim() !== ''),
      });
      setPatterns((prev) => [createdPattern, ...prev]);
      setNewPattern({ pattern_ko: '', pattern_en: '', examples: [], tags: [] });
      setNewPatternTags([]);
      setNewPatternExamples([]);
      setNewExampleValue('');
      setOpenAddDialog(false);
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 추가하는데 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatternClick = (patternId: string) => {
    setDeleteConfirmDialog({ open: true, patternId });
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmDialog({ open: false, patternId: null });
  };

  const handleDeletePattern = async () => {
    const patternId = deleteConfirmDialog.patternId;
    if (!patternId) return;

    try {
      await deletePattern(patternId);
      setPatterns((prev) => prev.filter((pattern) => pattern.id !== patternId));
      loadStats();
      handleDeleteConfirmClose();
      showSnackbar('패턴이 삭제되었습니다.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 삭제하는데 실패했습니다.');
      handleDeleteConfirmClose();
    }
  };

  const handleAddTag = async (patternId: string, newTags: string[]) => {
    if (!user?.id || newTags.length === 0) return;

    try {
      const pattern = patterns.find((p) => p.id === patternId);
      if (!pattern) return;

      const currentTags = ensureTagsArray(pattern.tags);
      const updatedTags = Array.from(new Set([...currentTags, ...newTags.filter((tag) => tag.trim() !== '')]));

      const updatedPattern = await updatePattern(patternId, { tags: updatedTags });
      setPatterns((prev) => prev.map((p) => (p.id === updatedPattern.id ? updatedPattern : p)));
      setAddingTagPatternId(null);
      setNewTagValue('');
      const tags = new Set<string>();
      patterns.forEach((p) => {
        const pTags = ensureTagsArray(p.tags);
        if (pTags.length > 0) {
          pTags.forEach((tag) => tags.add(tag));
        }
      });
      updatedTags.forEach((tag) => tags.add(tag));
      setAvailableTags(Array.from(tags).sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : '태그를 추가하는데 실패했습니다.');
    }
  };

  const handlePlayEnglishSpeech = async (text: string) => {
    try {
      const { speakText } = await import('@/lib/tts');
      await speakText(text, 'en-US', true);
    } catch (error) {
      console.error('음성 재생 오류:', error);
      showSnackbar(
        error instanceof Error ? error.message : '음성 재생에 실패했습니다.',
        'error'
      );
    }
  };

  const handleDeleteTag = async (patternId: string, tagToDelete: string) => {
    if (!user?.id) return;

    try {
      const pattern = patterns.find((p) => p.id === patternId);
      if (!pattern) return;

      const currentTags = ensureTagsArray(pattern.tags);
      const updatedTags = currentTags.filter((tag) => tag !== tagToDelete);

      const updatedPattern = await updatePattern(patternId, { tags: updatedTags });
      setPatterns((prev) => prev.map((p) => (p.id === updatedPattern.id ? updatedPattern : p)));
      const tags = new Set<string>();
      patterns.forEach((p) => {
        const pTags = ensureTagsArray(p.tags);
        if (pTags.length > 0) {
          pTags.forEach((tag) => tags.add(tag));
        }
      });
      updatedTags.forEach((tag) => tags.add(tag));
      setAvailableTags(Array.from(tags).sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : '태그를 삭제하는데 실패했습니다.');
    }
  };

  const handleStartEdit = (pattern: Pattern) => {
    setEditingPatternId(pattern.id);
    setEditPatternData({
      pattern_ko: pattern.pattern_ko,
      pattern_en: pattern.pattern_en,
      examples: pattern.examples || [],
    });
  };

  const handleCancelEdit = () => {
    setEditingPatternId(null);
    setEditPatternData({ pattern_ko: '', pattern_en: '', examples: [] });
  };

  const handleSaveEdit = async (patternId: string) => {
    if (!editPatternData.pattern_ko.trim() || !editPatternData.pattern_en.trim()) {
      setError('한국어와 영어 패턴을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const updatedPattern = await updatePattern(patternId, {
        pattern_ko: editPatternData.pattern_ko.trim(),
        pattern_en: editPatternData.pattern_en.trim(),
        examples: editPatternData.examples.filter((ex) => ex.trim() !== ''),
      });
      setPatterns((prev) =>
        prev.map((pattern) => (pattern.id === updatedPattern.id ? updatedPattern : pattern))
      );
      setEditingPatternId(null);
      setEditPatternData({ pattern_ko: '', pattern_en: '', examples: [] });
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 수정하는데 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartAllReview = async () => {
    if (!user?.id) return;

    try {
      const allPatterns = await getPatterns(user.id);
      if (allPatterns.length === 0) {
        showSnackbar('복습할 패턴이 없습니다.', 'info');
        return;
      }
      setReviewMode('all');
      setReviewPatterns(allPatterns);
      setCurrentReviewIndex(0);
      setCurrentReviewPattern(allPatterns[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 불러오는데 실패했습니다.');
    }
  };

  const handleStartIncompleteReview = async () => {
    if (!user?.id) return;

    try {
      const allPatterns = await getPatterns(user.id);
      const incompletePatterns = allPatterns.filter((pattern) => !pattern.done);
      if (incompletePatterns.length === 0) {
        showSnackbar('복습할 패턴이 없습니다.', 'info');
        return;
      }
      setReviewMode('incomplete');
      setReviewPatterns(incompletePatterns);
      setCurrentReviewIndex(0);
      setCurrentReviewPattern(incompletePatterns[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 불러오는데 실패했습니다.');
    }
  };

  const handleStartCompletedReview = async () => {
    if (!user?.id) return;

    try {
      const allPatterns = await getPatterns(user.id);
      const completedPatterns = allPatterns.filter((pattern) => pattern.done);
      if (completedPatterns.length === 0) {
        showSnackbar('완료된 패턴이 없습니다.', 'info');
        return;
      }
      setReviewMode('completed');
      setReviewPatterns(completedPatterns);
      setCurrentReviewIndex(0);
      setCurrentReviewPattern(completedPatterns[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 불러오는데 실패했습니다.');
    }
  };

  const handleStartTagReview = async () => {
    if (!user?.id || !selectedReviewTag) return;

    try {
      const allPatterns = await getPatterns(user.id);
      const tagPatterns = allPatterns.filter((pattern) => {
        const patternTags = ensureTagsArray(pattern.tags);
        return patternTags.includes(selectedReviewTag);
      });
      if (tagPatterns.length === 0) {
        showSnackbar('선택한 태그가 있는 패턴이 없습니다.', 'info');
        return;
      }
      setReviewMode('all');
      setReviewPatterns(tagPatterns);
      setCurrentReviewIndex(0);
      setCurrentReviewPattern(tagPatterns[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
      setOpenTagReviewDialog(false);
      setSelectedReviewTag(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '패턴을 불러오는데 실패했습니다.');
    }
  };

  const handlePreviousPattern = () => {
    if (currentReviewIndex > 0) {
      const prevIndex = currentReviewIndex - 1;
      setCurrentReviewIndex(prevIndex);
      setCurrentReviewPattern(reviewPatterns[prevIndex]);
      setShowAnswer(false);
    }
  };

  const handleReviewSuccess = async () => {
    if (!currentReviewPattern) return;

    try {
      const updatedPattern = await updatePattern(currentReviewPattern.id, { done: true });
      setPatterns((prev) =>
        prev.map((pattern) => (pattern.id === updatedPattern.id ? updatedPattern : pattern))
      );
      setReviewPatterns((prev) =>
        prev.map((pattern) => (pattern.id === updatedPattern.id ? updatedPattern : pattern))
      );
      loadStats();
      handleNextPattern();
    } catch (err) {
      setError(err instanceof Error ? err.message : '복습 상태를 업데이트하는데 실패했습니다.');
    }
  };

  const handleReviewFailure = async () => {
    if (!currentReviewPattern) return;

    try {
      const updatedPattern = await updatePattern(currentReviewPattern.id, { done: false });
      setPatterns((prev) =>
        prev.map((pattern) => (pattern.id === updatedPattern.id ? updatedPattern : pattern))
      );
      setReviewPatterns((prev) =>
        prev.map((pattern) => (pattern.id === updatedPattern.id ? updatedPattern : pattern))
      );
      loadStats();
      handleNextPattern();
    } catch (err) {
      setError(err instanceof Error ? err.message : '복습 상태를 업데이트하는데 실패했습니다.');
    }
  };

  const handleNextPattern = () => {
    const nextIndex = currentReviewIndex + 1;
    if (nextIndex < reviewPatterns.length) {
      setCurrentReviewIndex(nextIndex);
      setCurrentReviewPattern(reviewPatterns[nextIndex]);
      setShowAnswer(false);
    } else {
      setOpenReviewDialog(false);
      setCurrentReviewPattern(null);
      setReviewPatterns([]);
      setCurrentReviewIndex(0);
      setReviewMode('all');
      setShowAnswer(false);
      showSnackbar('모든 패턴 복습을 완료했습니다!', 'success');
    }
  };

  if (authLoading || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }


  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        backgroundColor: 'black',
      }}
      >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          filter: 'grayscale(100%) brightness(0.5)',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        <iframe
          src="https://my.spline.design/aidatamodelinteraction-f5IdzSvCAf5704sHnlgjwlwh/"
          frameBorder="0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="fullscreen"
          title="Spline 3D Scene"
        />
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 4,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <IconButton
            onClick={() => router.push('/apps')}
            sx={{ color: 'white' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="white" fontWeight={500}>
            Patterns
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <MuiCard sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white', minWidth: '100px' }}>
            <CardContent>
              <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                전체 패턴
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.total}
              </Typography>
            </CardContent>
          </MuiCard>
          <MuiCard sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white', minWidth: '100px' }}>
            <CardContent>
              <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                복습 필요
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.incomplete}
              </Typography>
            </CardContent>
          </MuiCard>
          <MuiCard sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white', minWidth: '100px' }}>
            <CardContent>
              <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                완료
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.completed}
              </Typography>
            </CardContent>
          </MuiCard>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={handleStartAllReview}
            disabled={stats.total === 0}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            전체 복습 ({stats.total})
          </Button>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={handleStartIncompleteReview}
            disabled={stats.incomplete === 0}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            복습 미완료 ({stats.incomplete})
          </Button>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={handleStartCompletedReview}
            disabled={stats.completed === 0}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            복습 완료 ({stats.completed})
          </Button>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={() => setOpenTagReviewDialog(true)}
            disabled={availableTags.length === 0}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            태그 복습
          </Button>
        </Stack>

        {patterns.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'white',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, opacity: 0.7 }}>
              패턴이 없습니다
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              + 버튼을 눌러 패턴을 추가해보세요
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              {patterns.map((pattern: Pattern) => (
                <MuiCard
                key={pattern.id}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  height: '270px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0,
                  }}
                >
                  {(() => {
                    const patternTags = ensureTagsArray(pattern.tags);
                    const visibleTags = patternTags.slice(0, 2);
                    const remainingTags = patternTags.slice(2);
                    const isAddingTag = addingTagPatternId === pattern.id;

                    return (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        {visibleTags.map((tag: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            onDelete={() => handleDeleteTag(pattern.id, tag)}
                            deleteIcon={
                              <CloseIcon sx={{ fontSize: '0.75rem' }} />
                            }
                            sx={{
                              height: '20px',
                              fontSize: '0.65rem',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              '& .MuiChip-label': {
                                px: 0.7,
                              },
                              '& .MuiChip-deleteIcon': {
                                fontSize: '0.75rem',
                                margin: '0 2px 0 -4px',
                                color: 'rgba(255, 255, 255, 0.66)',
                                '&:hover': {
                                  color: 'rgba(255, 255, 255, 1)',
                                },
                              },
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.25)',
                              },
                            }}
                          />
                        ))}
                        {remainingTags.length > 0 && (
                          <TagTooltip tags={remainingTags} />
                        )}
                        {isAddingTag ? (
                          <TextField
                            placeholder="태그 추가"
                            size="small"
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newTagValue.trim()) {
                                e.preventDefault();
                                handleAddTag(pattern.id, [newTagValue.trim()]);
                              } else if (e.key === 'Escape') {
                                setAddingTagPatternId(null);
                                setNewTagValue('');
                              }
                            }}
                            onBlur={() => {
                              if (newTagValue.trim()) {
                                handleAddTag(pattern.id, [newTagValue.trim()]);
                              } else {
                                setAddingTagPatternId(null);
                                setNewTagValue('');
                              }
                            }}
                            autoFocus
                            sx={{
                              width: '120px',
                              '& .MuiInputBase-root': {
                                color: 'white',
                                fontSize: '0.75rem',
                                height: '20px',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.7)',
                                },
                              },
                              '& .MuiInputBase-input': {
                                py: 0.25,
                                px: 1,
                              },
                              '& .MuiInputBase-input::placeholder': {
                                opacity: 0.7,
                              },
                            }}
                          />
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setAddingTagPatternId(pattern.id);
                              setNewTagValue('');
                            }}
                            sx={{
                              width: '20px',
                              height: '20px',
                              color: 'white',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.25)',
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: '0.875rem' }} />
                          </IconButton>
                        )}
                      </Stack>
                    );
                  })()}

                  <Chip
                    label={pattern.done ? '완료' : '복습중'}
                    size="small"
                    color={pattern.done ? 'success' : 'warning'}
                  />
                </Box>

                <CardContent
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    pt: 2,
                    pb: 10,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '3px',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.5)',
                        },
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            영어 패턴
                          </Typography>
                          {editingPatternId !== pattern.id && pattern.pattern_en && (
                            <IconButton
                              size="small"
                              onClick={() => handlePlayEnglishSpeech(pattern.pattern_en)}
                              sx={{
                                width: '24px',
                                height: '24px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                  color: 'white',
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                },
                              }}
                            >
                              <VolumeUpIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          )}
                        </Box>
                        {editingPatternId === pattern.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editPatternData.pattern_en}
                            onChange={(e) =>
                              setEditPatternData((prev) => ({ ...prev, pattern_en: e.target.value }))
                            }
                            disabled={isSaving}
                            sx={{
                              '& .MuiInputBase-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.7)',
                                },
                              },
                            }}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {pattern.pattern_en}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                          한국어 패턴
                        </Typography>
                        {editingPatternId === pattern.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editPatternData.pattern_ko}
                            onChange={(e) =>
                              setEditPatternData((prev) => ({ ...prev, pattern_ko: e.target.value }))
                            }
                            disabled={isSaving}
                            sx={{
                              '& .MuiInputBase-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.7)',
                                },
                              },
                            }}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {pattern.pattern_ko}
                          </Typography>
                        )}
                      </Box>
                      {pattern.examples && pattern.examples.length > 0 && (
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                            예문
                          </Typography>
                          <Stack spacing={0.5}>
                            {pattern.examples.map((example, idx) => (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1 }}>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                  • {example}
                                </Typography>
                                {example && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handlePlayEnglishSpeech(example)}
                                    sx={{
                                      width: '20px',
                                      height: '20px',
                                      color: 'rgba(255, 255, 255, 0.7)',
                                      '&:hover': {
                                        color: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                      },
                                    }}
                                  >
                                    <VolumeUpIcon sx={{ fontSize: '0.875rem' }} />
                                  </IconButton>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </CardContent>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    pr: 1,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      복습 횟수: {pattern.review_count}
                    </Typography>
                    <Stack direction="row">
                      {editingPatternId === pattern.id ? (
                        <>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSaveEdit(pattern.id)}
                            disabled={isSaving}
                          >
                            저장
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<CloseIconOutlined />}
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            취소
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<EditIcon />}
                            onClick={() => handleStartEdit(pattern)}
                          >
                            편집
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeletePatternClick(pattern.id)}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Box>
                </MuiCard>
              ))}
              {isLoadingMore &&
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <MuiCard
                    key={`skeleton-${index}`}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      height: '270px',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        p: 1.5,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        flexShrink: 0,
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        width={60}
                        height={24}
                        sx={{ borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Skeleton
                          variant="text"
                          width={80}
                          height={16}
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                        />
                        <Stack direction="row" spacing={1}>
                          <Skeleton
                            variant="rectangular"
                            width={60}
                            height={32}
                            sx={{ borderRadius: '4px', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                          <Skeleton
                            variant="rectangular"
                            width={60}
                            height={32}
                            sx={{ borderRadius: '4px', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  </MuiCard>
                ))}
            </Box>
            {hasMore && (
              <Box
                ref={observerTargetRef}
                sx={{
                  height: '1px',
                  width: '100%',
                }}
              />
            )}
              {!hasMore && patterns.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'white', opacity: 0.5 }}>
                  <Typography variant="body2">모든 패턴을 불러왔습니다.</Typography>
                </Box>
              )}
            </>
          )}
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2,
        }}
        onClick={() => setOpenAddDialog(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={openAddDialog}
        onClose={() => !isSubmitting && setOpenAddDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '350px',
            maxHeight: 'auto',
            pb: 0
          },
        }}
      >
        <DialogTitle sx={{ pb:0 }}>패턴 추가</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            py: 0,
          }}
        >
          <Autocomplete
            multiple
            freeSolo
            size="small"
            sx={{ mt: 2 }}
            options={availableTags}
            value={newPatternTags}
            onChange={(_, newValue) => setNewPatternTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="태그 (엔터로 추가)"
                placeholder="태그를 입력하거나 선택하세요"
                disabled={isSubmitting}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                />
              ))
            }
            fullWidth
          />
          <TextField
            label="영어 패턴"
            fullWidth
            multiline
            rows={3}
            value={newPattern.pattern_en}
            onChange={(e) => setNewPattern((prev) => ({ ...prev, pattern_en: e.target.value }))}
            disabled={isSubmitting}
          />
          <TextField
            label="한국어 패턴"
            fullWidth
            multiline
            rows={3}
            value={newPattern.pattern_ko}
            onChange={(e) => setNewPattern((prev) => ({ ...prev, pattern_ko: e.target.value }))}
            disabled={isSubmitting}
          />
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
              예문 (엔터로 추가)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="예문을 입력하고 엔터를 누르세요"
              value={newExampleValue}
              onChange={(e) => setNewExampleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newExampleValue.trim()) {
                  e.preventDefault();
                  setNewPatternExamples((prev) => [...prev, newExampleValue.trim()]);
                  setNewExampleValue('');
                }
              }}
              disabled={isSubmitting}
            />
            {newPatternExamples.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                {newPatternExamples.map((example, idx) => (
                  <Chip
                    key={idx}
                    label={example}
                    size="small"
                    onDelete={() => {
                      setNewPatternExamples((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    deleteIcon={<CloseIcon sx={{ fontSize: '0.75rem' }} />}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => {
            setOpenAddDialog(false);
            setNewPattern({ pattern_ko: '', pattern_en: '', examples: [], tags: [] });
            setNewPatternTags([]);
            setNewPatternExamples([]);
            setNewExampleValue('');
          }} disabled={isSubmitting}>
            취소
          </Button>
          <Button
            onClick={handleAddPattern}
            variant="contained"
            disabled={isSubmitting || !newPattern.pattern_ko.trim() || !newPattern.pattern_en.trim()}
          >
            {isSubmitting ? <CircularProgress size={20} /> : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTagReviewDialog}
        onClose={() => {
          setOpenTagReviewDialog(false);
          setSelectedReviewTag(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>태그 선택</DialogTitle>
        <DialogContent
          sx={{
            maxHeight: '400px',
            overflowY: 'auto',
            px: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.5)',
              },
            },
          }}
        >
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
            복습할 태그를 선택하세요
          </Typography>
          {availableTags.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center', py: 4 }}>
              사용 가능한 태그가 없습니다
            </Typography>
          ) : (
            <Stack spacing={1}>
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedReviewTag === tag ? 'contained' : 'outlined'}
                  onClick={() => setSelectedReviewTag(tag)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                  }}
                >
                  {tag}
                </Button>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => {
            setOpenTagReviewDialog(false);
            setSelectedReviewTag(null);
          }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleStartTagReview}
            disabled={!selectedReviewTag}
          >
            복습 시작
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openReviewDialog}
        onClose={() => {
          setOpenReviewDialog(false);
          setReviewPatterns([]);
          setCurrentReviewIndex(0);
          setReviewMode('all');
          setShowAnswer(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            진행 상황: {currentReviewPattern ? `${currentReviewIndex + 1} / ${reviewPatterns.length}` : '0 / 0'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenReviewDialog(false);
              setReviewPatterns([]);
              setCurrentReviewIndex(0);
              setReviewMode('all');
              setShowAnswer(false);
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          {currentReviewPattern && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                  한국어 패턴
                </Typography>
                <Typography variant="h6">{currentReviewPattern.pattern_ko}</Typography>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    영어 패턴
                  </Typography>
                  {currentReviewPattern.pattern_en && (
                    <IconButton
                      size="small"
                      onClick={() => handlePlayEnglishSpeech(currentReviewPattern.pattern_en)}
                      sx={{
                        width: '24px',
                        height: '24px',
                        color: 'rgba(0, 0, 0, 0.7)',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <VolumeUpIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h6" color="primary" sx={{ minHeight: '32px' }}>
                  {currentReviewPattern.pattern_en}
                </Typography>
                {!showAnswer && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '24px',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowAnswer(true)}
                  >
                    <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                      정답 보기
                    </Button>
                  </Box>
                )}
              </Box>
              {currentReviewPattern.examples && currentReviewPattern.examples.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    예문
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '3px',
                        '&:hover': {
                          background: 'rgba(0, 0, 0, 0.5)',
                        },
                      },
                    }}
                  >
                    <Stack spacing={0.5}>
                      {currentReviewPattern.examples.map((example, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            • {example}
                          </Typography>
                          {example && (
                            <IconButton
                              size="small"
                              onClick={() => handlePlayEnglishSpeech(example)}
                              sx={{
                                width: '20px',
                                height: '20px',
                                color: 'rgba(0, 0, 0, 0.7)',
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                                },
                              }}
                            >
                              <VolumeUpIcon sx={{ fontSize: '0.875rem' }} />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, width: '100%', justifyContent: 'space-between' }}>
          <IconButton
            onClick={handlePreviousPattern}
            disabled={currentReviewIndex === 0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              visibility: showAnswer ? 'visible' : 'hidden',
              opacity: showAnswer ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleReviewSuccess}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
              }}
            >
              복습 성공
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleReviewFailure}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
              }}
            >
              복습 실패
            </Button>
          </Stack>
          <IconButton
            onClick={handleNextPattern}
            disabled={currentReviewIndex >= reviewPatterns.length - 1}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmDialog.open}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">패턴 삭제</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            이 패턴을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} color="inherit">
            취소
          </Button>
          <Button onClick={handleDeletePattern} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

