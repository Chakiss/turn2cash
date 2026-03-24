import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/leadService';
import type { LeadFormData, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadFormData = await request.json();
    
    // Validate required fields
    if (!leadData.name || !leadData.phone || !leadData.address || !leadData.device) {
      return NextResponse.json({
        status: 'error',
        message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ'
      } as ApiResponse, { status: 400 });
    }
    
    // Validate device data
    if (!leadData.device.brand || !leadData.device.model || !leadData.device.storage || !leadData.device.condition) {
      return NextResponse.json({
        status: 'error',
        message: 'ข้อมูลอุปกรณ์ไม่ครบถ้วน'
      } as ApiResponse, { status: 400 });
    }
    
    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{9,10}$/;
    const cleanPhone = leadData.phone.replace(/-/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({
        status: 'error',
        message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
      } as ApiResponse, { status: 400 });
    }
    
    // Create lead in Firestore
    const leadId = await createLead(leadData);
    
    return NextResponse.json({
      status: 'success',
      lead_id: leadId,
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว'
    } as ApiResponse, { status: 201 });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
    } as ApiResponse, { status: 500 });
  }
}

// Optional: GET method to retrieve lead by ID
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leadId = searchParams.get('id');
  
  if (!leadId) {
    return NextResponse.json({
      status: 'error',
      message: 'ไม่พบรหัสการขาย'
    } as ApiResponse, { status: 400 });
  }
  
  // Implementation for getting lead by ID would go here
  // For MVP, this might not be necessary
  
  return NextResponse.json({
    status: 'error',
    message: 'ฟังก์ชันนี้ยังไม่พร้อมใช้งาน'
  } as ApiResponse, { status: 501 });
}