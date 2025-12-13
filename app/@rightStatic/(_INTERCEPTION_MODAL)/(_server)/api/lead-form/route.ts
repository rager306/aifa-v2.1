//app/@rightStatic/(_INTERCEPTION_MODAL)/(_server)/api/lead-form/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  email: z.string().email("Please enter a valid email."),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = leadFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validationResult.error.flatten().fieldErrors,
          message: "Validation error. Please check your input.",
        },
        { status: 400 },
      )
    }

    const { name: _name, phone: _phone, email: _email } = validationResult.data

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Your request has been sent successfully. We will contact you shortly.",
      mock: true,
    })
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    )
  }
}

// Handle CORS preflight requests
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
