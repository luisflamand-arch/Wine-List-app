import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { wineId, wineName, tableName, quantity, orderId } = await request.json();

    // Get admin email - in this case we'll use the app owner email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@winelist.local';

    // Create styled HTML email
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px;">
        <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #D4AF37;">
          <h2 style="color: #1a1a2e; margin-top: 0; margin-bottom: 20px;">
            🍷 Nueva Solicitud de Vino
          </h2>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Vino:</strong> ${wineName}</p>
            <p style="margin: 10px 0;"><strong>Mesa:</strong> ${tableName}</p>
            <p style="margin: 10px 0;"><strong>Cantidad:</strong> ${quantity} botella${quantity > 1 ? 's' : ''}</p>
            <p style="margin: 10px 0;"><strong>ID Orden:</strong> ${orderId}</p>
          </div>

          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            Un comensal ha solicitado este vino. El mesero debe aprobarlo antes de proceder.
          </p>

          <a href="${process.env.NEXTAUTH_URL}/admin?tab=requests" style="display: inline-block; background: #D4AF37; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            Ver Solicitudes
          </a>

          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            Generado automáticamente por ${process.env.NEXTAUTH_URL}
          </p>
        </div>
      </div>
    `;

    // Send notification
    const appUrl = process.env.NEXTAUTH_URL || '';
    const appName = appUrl ? new URL(appUrl).hostname.split('.')[0] : 'Wine List';

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_WINE_REQUEST_ALERT,
        subject: `🍷 Nueva solicitud: ${wineName} - Mesa ${tableName}`,
        body: htmlBody,
        is_html: true,
        recipient_email: adminEmail,
        sender_email: `noreply@${new URL(appUrl).hostname}`,
        sender_alias: `${appName} - Wine List`,
      }),
    });

    const result = await response.json();

    // If notification is disabled, it's ok - we still consider the alert "sent"
    if (!result.success && !result.notification_disabled) {
      console.error('Error sending wine request alert:', result.message);
      // Don't throw error - the wine request was already created
      // We just log the notification failure
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in wine request alert:', error);
    // Don't fail the request - alerts are secondary to the main operation
    return NextResponse.json({ success: true });
  }
}
