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

interface FormState {
  title: string;
  nurseryName: string;
  visitDate: string;
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
}

export const QuestionListCreator = ({
  onCreate,
  onCancel,
}: QuestionListCreatorProps) => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    nurseryName: '',
    visitDate: '',
    errors: {},
    touched: {},
  });

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
    setFormState((prev) => ({
      ...prev,
      title: value,
      errors: prev.touched.title
        ? { ...prev.errors, title: validateTitle(value) }
        : prev.errors,
    }));
  };

  const handleTitleBlur = () => {
    const error = validateTitle(formState.title);
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, title: true },
      errors: { ...prev.errors, title: error },
    }));
  };

  const isFormValid = () => {
    return formState.title.trim() && !formState.errors.title;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleError = validateTitle(formState.title);
    if (titleError) {
      setFormState((prev) => ({
        ...prev,
        errors: { title: titleError },
        touched: { title: true },
      }));
      return;
    }

    // 日付の妥当性チェック
    const parsedDate = formState.visitDate
      ? new Date(formState.visitDate)
      : undefined;
    const validDate =
      parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined;

    onCreate({
      title: formState.title.trim(),
      nurseryName: formState.nurseryName.trim(),
      visitDate: validDate,
    });
  };

  const handleNurseryNameChange = (value: string) => {
    setFormState((prev) => ({ ...prev, nurseryName: value }));
  };

  const handleVisitDateChange = (value: string) => {
    setFormState((prev) => ({ ...prev, visitDate: value }));
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
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        border="1px solid #e2e8f0"
      >
        <VStack gap={4} align="stretch">
          <div>
            <label
              htmlFor="title"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'medium',
                color: '#4a5568',
              }}
            >
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={formState.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="質問リストのタイトルを入力"
              aria-required="true"
              aria-describedby={
                formState.touched.title && formState.errors.title
                  ? titleErrorId
                  : undefined
              }
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#f7fafc',
                fontSize: '16px',
                borderColor:
                  formState.touched.title && formState.errors.title
                    ? '#e53e3e'
                    : '#e2e8f0',
              }}
            />
            {formState.touched.title && formState.errors.title && (
              <div
                id={titleErrorId}
                style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}
              >
                {formState.errors.title}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="nurseryName"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'medium',
                color: '#4a5568',
              }}
            >
              保育園名
            </label>
            <input
              id="nurseryName"
              type="text"
              value={formState.nurseryName}
              onChange={(e) => handleNurseryNameChange(e.target.value)}
              placeholder="見学予定の保育園名（任意）"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#f7fafc',
                fontSize: '16px',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="visitDate"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'medium',
                color: '#4a5568',
              }}
            >
              見学予定日
            </label>
            <input
              id="visitDate"
              type="date"
              value={formState.visitDate}
              onChange={(e) => handleVisitDateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#f7fafc',
                fontSize: '16px',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
              paddingTop: '24px',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'medium',
                minWidth: '100px',
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isFormValid() ? '#3182ce' : '#cbd5e0',
                color: 'white',
                cursor: isFormValid() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'medium',
                minWidth: '100px',
                opacity: isFormValid() ? 1 : 0.6,
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
