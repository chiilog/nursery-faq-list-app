import { useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';

interface QuestionListCreatorProps {
  onCreate: (data: {
    title: string;
    nurseryName: string;
    visitDate: Date | undefined;
  }) => void;
  onCancel: () => void;
}

export const QuestionListCreator = ({
  onCreate,
  onCancel,
}: QuestionListCreatorProps) => {
  const [title, setTitle] = useState('');
  const [nurseryName, setNurseryName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateTitle = (value: string): string => {
    if (!value.trim()) {
      return 'タイトルは必須です';
    }
    if (value.length > 100) {
      return 'タイトルは100文字以内で入力してください';
    }
    return '';
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (touched.title) {
      const error = validateTitle(value);
      setErrors((prev) => ({ ...prev, title: error }));
    }
  };

  const handleTitleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    const error = validateTitle(title);
    setErrors((prev) => ({ ...prev, title: error }));
  };

  const isFormValid = () => {
    const titleError = validateTitle(title);
    return title.trim() && !titleError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleError = validateTitle(title);
    if (titleError) {
      setErrors({ title: titleError });
      setTouched({ title: true });
      return;
    }

    onCreate({
      title: title.trim(),
      nurseryName: nurseryName.trim(),
      visitDate: visitDate ? new Date(visitDate) : undefined,
    });
  };

  const titleErrorId = 'title-error';

  return (
    <Box maxW="md" mx="auto" p={6}>
      <h2>新しい質問リストを作成</h2>
      <Box
        as="form"
        role="form"
        aria-label="質問リスト作成フォーム"
        onSubmit={handleSubmit}
        p={6}
      >
        <VStack spacing={4} align="stretch">
          <div>
            <label htmlFor="title">タイトル</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="質問リストのタイトルを入力"
              aria-required="true"
              aria-describedby={
                touched.title && errors.title ? titleErrorId : undefined
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            {touched.title && errors.title && (
              <div
                id={titleErrorId}
                style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}
              >
                {errors.title}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="nurseryName">保育園名</label>
            <input
              id="nurseryName"
              type="text"
              value={nurseryName}
              onChange={(e) => setNurseryName(e.target.value)}
              placeholder="見学予定の保育園名（任意）"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div>
            <label htmlFor="visitDate">見学予定日</label>
            <input
              id="visitDate"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isFormValid() ? '#3182ce' : '#ccc',
                color: 'white',
                cursor: isFormValid() ? 'pointer' : 'not-allowed',
              }}
            >
              作成
            </button>
          </div>
        </VStack>
      </Box>
    </Box>
  );
};
