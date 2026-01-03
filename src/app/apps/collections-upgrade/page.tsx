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
  getCards,
  getCardsPaginated,
  getCardStats,
  createCard,
  deleteCard,
  updateCard,
} from '@/lib/supabase/cards';
import type { Card, CreateCardData } from '@/types/card';

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
 * Collections & Upgrade 페이지
 *
 * 카드 목록 확인, 카드 추가, 카드 복습 기능 제공
 */
export default function CollectionsUpgradePage() {
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
  const [cards, setCards] = useState<Card[]>([]);
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
  const [currentReviewCard, setCurrentReviewCard] = useState<Card | null>(null);
  const [reviewCards, setReviewCards] = useState<Card[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [showAnswer, setShowAnswer] = useState(false);

  // 카드 편집 상태
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardData, setEditCardData] = useState<{ ko: string; en: string }>({
    ko: '',
    en: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // 카드 추가 폼 상태
  const [newCard, setNewCard] = useState<CreateCardData>({
    ko: '',
    en: '',
    tags: [],
  });
  const [newCardTags, setNewCardTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [addingTagCardId, setAddingTagCardId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState<string>('');

  const [openTagReviewDialog, setOpenTagReviewDialog] = useState(false);
  const [selectedReviewTag, setSelectedReviewTag] = useState<string | null>(null);

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    cardId: string | null;
  }>({
    open: false,
    cardId: null,
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
      loadCards(true);
      loadStats();
    }
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (cards.length > 0) {
      const tags = new Set<string>();
      cards.forEach((card) => {
        const cardTags = ensureTagsArray(card.tags);
        if (cardTags.length > 0) {
          cardTags.forEach((tag) => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags).sort());
    }
  }, [cards]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const cardStats = await getCardStats(user.id);
      setStats(cardStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadCards = useCallback(
    async (reset: boolean = false) => {
      if (!user?.id) return;

      try {
        if (reset) {
          setIsLoading(true);
          setCurrentPage(0);
          currentPageRef.current = 0;
          setCards([]);
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

        const { cards: newCards, hasMore: more } = await getCardsPaginated(
          user.id,
          page,
          pageSize
        );

        if (reset) {
          setCards(newCards);
          setCurrentPage(INITIAL_PAGE_SIZE / PAGE_SIZE);
          currentPageRef.current = INITIAL_PAGE_SIZE / PAGE_SIZE;
          loadedOffsetRef.current = INITIAL_PAGE_SIZE;
        } else {
          setCards((prev) => {
            const existingIds = new Set(prev.map((card) => card.id));
            const uniqueNewCards = newCards.filter((card) => !existingIds.has(card.id));
            return [...prev, ...uniqueNewCards];
          });
          const nextPage = currentPageRef.current + 1;
          setCurrentPage(nextPage);
          currentPageRef.current = nextPage;
          loadedOffsetRef.current += newCards.length;
        }
        setHasMore(more);
      } catch (err) {
        setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다.');
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
          loadCards(false).finally(() => {
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
  }, [hasMore, isLoading, isLoadingMore, loadCards, user?.id]);

  const handleAddCard = async () => {
    if (!user?.id) return;

    if (!newCard.ko.trim() || !newCard.en.trim()) {
      setError('한국어와 영어를 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const createdCard = await createCard(user.id, {
        ko: newCard.ko.trim(),
        en: newCard.en.trim(),
        tags: newCardTags.filter((tag) => tag.trim() !== ''),
      });
      setCards((prev) => [createdCard, ...prev]);
      setNewCard({ ko: '', en: '', tags: [] });
      setNewCardTags([]);
      setOpenAddDialog(false);
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 추가하는데 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCardClick = (cardId: string) => {
    setDeleteConfirmDialog({ open: true, cardId });
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmDialog({ open: false, cardId: null });
  };

  const handleDeleteCard = async () => {
    const cardId = deleteConfirmDialog.cardId;
    if (!cardId) return;

    try {
      await deleteCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      loadStats();
      handleDeleteConfirmClose();
      showSnackbar('카드가 삭제되었습니다.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 삭제하는데 실패했습니다.');
      handleDeleteConfirmClose();
    }
  };

  const handleAddTag = async (cardId: string, newTags: string[]) => {
    if (!user?.id || newTags.length === 0) return;

    try {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;

      const currentTags = ensureTagsArray(card.tags);
      const updatedTags = Array.from(new Set([...currentTags, ...newTags.filter((tag) => tag.trim() !== '')]));

      const updatedCard = await updateCard(cardId, { tags: updatedTags });
      setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
      setAddingTagCardId(null);
      setNewTagValue('');
      const tags = new Set<string>();
      cards.forEach((c) => {
        const cTags = ensureTagsArray(c.tags);
        if (cTags.length > 0) {
          cTags.forEach((tag) => tags.add(tag));
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
      await speakText(text, 'en-US');
    } catch (error) {
      console.error('음성 재생 오류:', error);
      showSnackbar(
        error instanceof Error ? error.message : '음성 재생에 실패했습니다.',
        'error'
      );
    }
  };

  const handleDeleteTag = async (cardId: string, tagToDelete: string) => {
    if (!user?.id) return;

    try {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;

      const currentTags = ensureTagsArray(card.tags);
      const updatedTags = currentTags.filter((tag) => tag !== tagToDelete);

      const updatedCard = await updateCard(cardId, { tags: updatedTags });
      setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
      const tags = new Set<string>();
      cards.forEach((c) => {
        const cTags = ensureTagsArray(c.tags);
        if (cTags.length > 0) {
          cTags.forEach((tag) => tags.add(tag));
        }
      });
      updatedTags.forEach((tag) => tags.add(tag));
      setAvailableTags(Array.from(tags).sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : '태그를 삭제하는데 실패했습니다.');
    }
  };

  const handleStartEdit = (card: Card) => {
    setEditingCardId(card.id);
    setEditCardData({ ko: card.ko, en: card.en });
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditCardData({ ko: '', en: '' });
  };

  const handleSaveEdit = async (cardId: string) => {
    if (!editCardData.ko.trim() || !editCardData.en.trim()) {
      setError('한국어와 영어를 모두 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const updatedCard = await updateCard(cardId, {
        ko: editCardData.ko.trim(),
        en: editCardData.en.trim(),
      });
      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      setEditingCardId(null);
      setEditCardData({ ko: '', en: '' });
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 수정하는데 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartAllReview = async () => {
    if (!user?.id) return;

    try {
      const allCards = await getCards(user.id);
      if (allCards.length === 0) {
        showSnackbar('복습할 카드가 없습니다.', 'info');
        return;
      }
      setReviewMode('all');
      setReviewCards(allCards);
      setCurrentReviewIndex(0);
      setCurrentReviewCard(allCards[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다.');
    }
  };

  const handleStartIncompleteReview = async () => {
    if (!user?.id) return;

    try {
      const allCards = await getCards(user.id);
      const incompleteCards = allCards.filter((card) => !card.done);
      if (incompleteCards.length === 0) {
        showSnackbar('복습할 카드가 없습니다.', 'info');
        return;
      }
      setReviewMode('incomplete');
      setReviewCards(incompleteCards);
      setCurrentReviewIndex(0);
      setCurrentReviewCard(incompleteCards[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다.');
    }
  };

  const handleStartCompletedReview = async () => {
    if (!user?.id) return;

    try {
      const allCards = await getCards(user.id);
      const completedCards = allCards.filter((card) => card.done);
      if (completedCards.length === 0) {
        showSnackbar('완료된 카드가 없습니다.', 'info');
        return;
      }
      setReviewMode('completed');
      setReviewCards(completedCards);
      setCurrentReviewIndex(0);
      setCurrentReviewCard(completedCards[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다.');
    }
  };

  const handleStartTagReview = async () => {
    if (!user?.id || !selectedReviewTag) return;

    try {
      const allCards = await getCards(user.id);
      const tagCards = allCards.filter((card) => {
        const cardTags = ensureTagsArray(card.tags);
        return cardTags.includes(selectedReviewTag);
      });
      if (tagCards.length === 0) {
        showSnackbar('선택한 태그가 있는 카드가 없습니다.', 'info');
        return;
      }
      setReviewMode('all');
      setReviewCards(tagCards);
      setCurrentReviewIndex(0);
      setCurrentReviewCard(tagCards[0]);
      setShowAnswer(false);
      setOpenReviewDialog(true);
      setOpenTagReviewDialog(false);
      setSelectedReviewTag(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다.');
    }
  };

  const handlePreviousCard = () => {
    if (currentReviewIndex > 0) {
      const prevIndex = currentReviewIndex - 1;
      setCurrentReviewIndex(prevIndex);
      setCurrentReviewCard(reviewCards[prevIndex]);
      setShowAnswer(false);
    }
  };

  const handleReviewSuccess = async () => {
    if (!currentReviewCard) return;

    try {
      const updatedCard = await updateCard(currentReviewCard.id, { done: true });
      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      setReviewCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      loadStats();
      handleNextCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : '복습 상태를 업데이트하는데 실패했습니다.');
    }
  };

  const handleReviewFailure = async () => {
    if (!currentReviewCard) return;

    try {
      const updatedCard = await updateCard(currentReviewCard.id, { done: false });
      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      setReviewCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      loadStats();
      handleNextCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : '복습 상태를 업데이트하는데 실패했습니다.');
    }
  };

  const handleNextCard = () => {
    const nextIndex = currentReviewIndex + 1;
    if (nextIndex < reviewCards.length) {
      setCurrentReviewIndex(nextIndex);
      setCurrentReviewCard(reviewCards[nextIndex]);
      setShowAnswer(false);
    } else {
      setOpenReviewDialog(false);
      setCurrentReviewCard(null);
      setReviewCards([]);
      setCurrentReviewIndex(0);
      setReviewMode('all');
      setShowAnswer(false);
      showSnackbar('모든 카드 복습을 완료했습니다!', 'success');
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

  const reviewCardsCount = stats.incomplete;
  const completedCardsCount = stats.completed;

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
            Collections & Upgrade
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <MuiCard sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white', minWidth: '100px' }}>
            <CardContent>
              <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                전체 카드
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

        {cards.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'white',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, opacity: 0.7 }}>
              카드가 없습니다
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              + 버튼을 눌러 카드를 추가해보세요
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
              {cards.map((card: Card) => (
                <MuiCard
                key={card.id}
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
                    const cardTags = ensureTagsArray(card.tags);
                    const visibleTags = cardTags.slice(0, 2);
                    const remainingTags = cardTags.slice(2);
                    const isAddingTag = addingTagCardId === card.id;

                    return (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        {visibleTags.map((tag: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            onDelete={() => handleDeleteTag(card.id, tag)}
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
                                handleAddTag(card.id, [newTagValue.trim()]);
                              } else if (e.key === 'Escape') {
                                setAddingTagCardId(null);
                                setNewTagValue('');
                              }
                            }}
                            onBlur={() => {
                              if (newTagValue.trim()) {
                                handleAddTag(card.id, [newTagValue.trim()]);
                              } else {
                                setAddingTagCardId(null);
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
                              setAddingTagCardId(card.id);
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
                    label={card.done ? '완료' : '복습중'}
                    size="small"
                    color={card.done ? 'success' : 'warning'}
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
                            영어
                          </Typography>
                          {editingCardId !== card.id && card.en && (
                            <IconButton
                              size="small"
                              onClick={() => handlePlayEnglishSpeech(card.en)}
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
                        {editingCardId === card.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editCardData.en}
                            onChange={(e) =>
                              setEditCardData((prev) => ({ ...prev, en: e.target.value }))
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
                            {card.en}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                          한국어
                        </Typography>
                        {editingCardId === card.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editCardData.ko}
                            onChange={(e) =>
                              setEditCardData((prev) => ({ ...prev, ko: e.target.value }))
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
                            {card.ko}
                          </Typography>
                        )}
                      </Box>
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
                      복습 횟수: {card.review_count}
                    </Typography>
                    <Stack direction="row">
                      {editingCardId === card.id ? (
                        <>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSaveEdit(card.id)}
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
                            onClick={() => handleStartEdit(card)}
                          >
                            편집
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCardClick(card.id)}
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
              {!hasMore && cards.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'white', opacity: 0.5 }}>
                  <Typography variant="body2">모든 카드를 불러왔습니다.</Typography>
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
        <DialogTitle sx={{ pb:0 }}>카드 추가</DialogTitle>
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
            value={newCardTags}
            onChange={(_, newValue) => setNewCardTags(newValue)}
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
            label="영어"
            fullWidth
            multiline
            rows={4}
            value={newCard.en}
            onChange={(e) => setNewCard((prev) => ({ ...prev, en: e.target.value }))}
            disabled={isSubmitting}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '100px',
              },
            }}
          />
          <TextField
            label="한국어"
            fullWidth
            multiline
            rows={4}
            value={newCard.ko}
            onChange={(e) => setNewCard((prev) => ({ ...prev, ko: e.target.value }))}
            disabled={isSubmitting}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '100px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)} disabled={isSubmitting}>
            취소
          </Button>
          <Button
            onClick={handleAddCard}
            variant="contained"
            disabled={isSubmitting || !newCard.ko.trim() || !newCard.en.trim()}
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
          setReviewCards([]);
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
            진행 상황: {currentReviewCard ? `${currentReviewIndex + 1} / ${reviewCards.length}` : '0 / 0'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenReviewDialog(false);
              setReviewCards([]);
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
          {currentReviewCard && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                  한국어
                </Typography>
                <Typography variant="h6">{currentReviewCard.ko}</Typography>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    영어
                  </Typography>
                  {currentReviewCard.en && (
                    <IconButton
                      size="small"
                      onClick={() => handlePlayEnglishSpeech(currentReviewCard.en)}
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
                  {currentReviewCard.en}
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
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, width: '100%', justifyContent: 'space-between' }}>
          <IconButton
            onClick={handlePreviousCard}
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
            onClick={handleNextCard}
            disabled={currentReviewIndex >= reviewCards.length - 1}
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
        <DialogTitle id="delete-dialog-title">카드 삭제</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            이 카드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} color="inherit">
            취소
          </Button>
          <Button onClick={handleDeleteCard} color="error" variant="contained">
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

