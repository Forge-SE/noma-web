import { useCallback, useMemo } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

export function useModalParams() {
  const navigate = useNavigate();
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  const params = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const activeModal = params.get('modal');
  const modalId = params.get('modalId');

  const openModal = useCallback(
    (modal: string, id?: string) => {
      (navigate as any)({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          modal,
          ...(id ? { modalId: id } : {}),
        }),
      });
    },
    [navigate],
  );

  const closeModal = useCallback(() => {
    (navigate as any)({
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev };
        delete next.modal;
        delete next.modalId;
        return next;
      },
    });
  }, [navigate]);

  return { activeModal, modalId, openModal, closeModal };
}
