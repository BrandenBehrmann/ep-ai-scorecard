// app/a/[code]/page.tsx
// Short URL redirect for assessment portal: /a/PS-ABC123 -> /assessment/portal?token=xxx

import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ShortAssessmentRedirect({ params }: PageProps) {
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
      .select('token, status')
      .eq('token', code)
      .single();

    if (legacyAssessment) {
      // Redirect based on status - check for released or report_ready
      if (legacyAssessment.status === 'report_ready') {
        redirect(`/assessment/report?token=${legacyAssessment.token}`);
      }
      redirect(`/assessment/portal?token=${legacyAssessment.token}`);
    }

    notFound();
  }

  // Redirect to portal with the full token
  redirect(`/assessment/portal?token=${assessment.token}`);
}
