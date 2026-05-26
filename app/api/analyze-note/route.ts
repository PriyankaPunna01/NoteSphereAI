// app/api/analyze-note/route.ts

import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(req: Request) {

  try {

    const { content } =
      await req.json()

    // VALIDATION
    if (
      !content ||
      !content.trim()
    ) {

      return NextResponse.json(
        {
          error:
            'No content provided.',
        },
        {
          status: 400,
        }
      )
    }

    // LIMIT CONTENT SIZE
    const limitedContent =
      content.slice(0, 12000)

    // AI REQUEST
    const response =
      await client.chat.completions.create({
        model:
          'llama-3.3-70b-versatile',

        temperature: 0.2,

        max_tokens: 700,

        response_format: {
          type: 'json_object',
        },

        messages: [
          {
            role: 'system',

            content:
              'You are an AI assistant that summarizes notes and classifies them into categories. Return ONLY valid JSON.',
          },

          {
            role: 'user',

            content: `
Analyze the following note and return ONLY valid JSON in this exact format:

{
  "summary": "A concise summary.",
  "category": "Study"
}

Summary Length Rules:
- If the note is under 100 words, return a 1-2 sentence summary.
- If the note is 100-500 words, return a 3-5 sentence summary.
- If the note is 500-1500 words, return a 1-2 paragraph summary.
- If the note is longer than 1500 words, return a detailed but concise summary covering all key points.

General Rules:
- Use your own words.
- Do not copy sentences directly.
- Keep only important points.
- Preserve the meaning.
- Return ONLY valid JSON.
- No markdown.
- No extra explanation.

Valid categories:
- Study
- Work
- Personal
- Ideas
- Projects

Note:
${limitedContent}
            `,
          },
        ],
      })

    // RAW AI RESPONSE
    const text =
      response.choices?.[0]
        ?.message?.content || '{}'

    console.log(
      'RAW AI RESPONSE:',
      text
    )

    // CLEAN RESPONSE
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let result = {
      summary: '',
      category: 'General',
    }

    try {

      const parsed =
        JSON.parse(cleanedText)

      result = {
        summary:
          parsed.summary ||
          'No summary generated.',

        category:
          parsed.category ||
          'General',
      }

    } catch (err) {

      console.error(
        'JSON Parse Error:',
        cleanedText
      )

      // FALLBACK SUMMARY
      result = {
        summary:
          cleanedText.substring(
            0,
            300
          ) ||
          'Unable to summarize.',

        category: 'General',
      }
    }

    // FINAL RESPONSE
    return NextResponse.json({
      summary: result.summary,
      category: result.category,
    })

  } catch (error) {

    console.error(
      'AI analysis error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to analyze note.',
      },
      {
        status: 500,
      }
    )
  }
}