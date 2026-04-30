import { FieldBlock } from '@/components/admin/club-info/FieldBlock';
import { AdminInfoCard } from '@/components/admin/club-info/AdminInfoCard';
import { Input } from '@/components/ui';
import { PRIMARY_CONTACT_OPTIONS } from '@/constants/admin/clubInfo.constants';
import { cn } from '@/lib/cn';
import type { ClubInfoFormData } from '@/lib/schemas/clubInfo';

interface ClubInfoContactSectionProps {
  phone: string;
  email: string;
  primaryContact: ClubInfoFormData['primaryContact'];
  phoneError?: string;
  emailError?: string;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPrimaryContactChange: (value: ClubInfoFormData['primaryContact']) => void;
}

function ClubInfoContactSection({
  phone,
  email,
  primaryContact,
  phoneError,
  emailError,
  onPhoneChange,
  onEmailChange,
  onPrimaryContactChange,
}: ClubInfoContactSectionProps) {
  const isEmailContactDisabled = !email.trim() || Boolean(emailError);
  return (
    <AdminInfoCard
      title="연락처"
      titleGapClassName="mt-[58px]"
      contentClassName="gap-0"
      className="pb-[40px]"
    >
      <div className="flex flex-col gap-400">
        <FieldBlock label="대표 전화번호" error={phoneError}>
          <Input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
          />
        </FieldBlock>

        <FieldBlock label="대표 이메일" error={emailError}>
          <Input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="대표 이메일을 작성해주세요"
            className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
          />
        </FieldBlock>

        <FieldBlock label="주 연락처">
          <div className="flex gap-200">
            {PRIMARY_CONTACT_OPTIONS.map((option) => {
              const isDisabled = option.value === 'email' && isEmailContactDisabled;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-200',
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={primaryContact === option.value}
                    disabled={isDisabled}
                    onChange={() => onPrimaryContactChange(option.value)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                      isDisabled
                        ? 'border-icon-disabled'
                        : primaryContact === option.value
                          ? 'border-brand-primary'
                          : 'border-text-alternative',
                    )}
                  >
                    {primaryContact === option.value && (
                      <div className="bg-brand-primary h-2.5 w-2.5 rounded-full" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'typo-body2',
                      isDisabled ? 'text-text-disabled' : 'text-text-normal',
                    )}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </FieldBlock>
      </div>
    </AdminInfoCard>
  );
}

export { ClubInfoContactSection };
export type { ClubInfoContactSectionProps };
