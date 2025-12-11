// app/r/[code]/page.tsx
// Short URL redirect for report: /r/PS-ABC123 -> /assessment/report?token=xxx

import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ShortReportRedirect({ params }: PageProps) {
  const { code } = await params;
  const supabase = createServerClient();

  // Look up assessment by short code
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('token, status')
    .eq('short_code', code.toUpperCase())
    .single();

  if (error || !assessment) {
    // Try looking up by token for backwards compatibility
    const { data: legacyAssessment } = await supabase
      .from('assessments')
      .select('token')
      .eq('token', code)
      .single();

    if (legacyAssessment) {
      redirect(`/assessment/report?token=${legacyAssessment.token}`);
    }

    notFound();
  }

  // Redirect to report with the full token
  redirect(`/assessment/report?token=${assessment.token}`);
}
