package com.example.domain.ai

import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

sealed class AiResult<out T> {
    data class Success<T>(val data: T) : AiResult<T>()
    data class Error(val message: String) : AiResult<Nothing>()
    object Idle : AiResult<Nothing>()
    object Loading : AiResult<Nothing>()
}

class StudyAiService {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    fun isConfigured(): Boolean {
        val key = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Exception) {
            ""
        }
        return key.isNotBlank() && key != "MY_GEMINI_API_KEY"
    }

    suspend fun getStudyCoachRecommendation(
        studentName: String,
        studiedMinutesToday: Int,
        totalSessions: Int,
        weakTopics: List<String>,
        strongTopics: List<String>
    ): AiResult<String> = withContext(Dispatchers.IO) {
        val apiKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Exception) {
            ""
        }

        if (!isConfigured()) {
            // Intelligent heuristic coach recommendation when API key is not yet set in Secrets
            val advice = buildHeuristicCoachAdvice(studentName, studiedMinutesToday, totalSessions, weakTopics, strongTopics)
            return@withContext AiResult.Success(advice)
        }

        try {
            val prompt = """
                You are StudyFlow AI Coach, an elite, youthful, no-nonsense Gen-Z study advisor.
                Student: $studentName
                Studied Today: $studiedMinutesToday minutes across $totalSessions sessions.
                Topics needing attention: ${weakTopics.joinToString(", ").ifEmpty { "None currently" }}
                Strong topics: ${strongTopics.joinToString(", ").ifEmpty { "Consistent" }}
                
                Give a sharp 3-bullet personalized study recommendation. Keep it actionable, direct, zero fluff, motivating without cringe slang.
            """.trimIndent()

            val jsonBody = JSONObject().apply {
                val contentsArray = JSONArray()
                val contentObj = JSONObject().apply {
                    val partsArray = JSONArray()
                    partsArray.put(JSONObject().apply {
                        put("text", prompt)
                    })
                    put("parts", partsArray)
                }
                contentsArray.put(contentObj)
                put("contents", contentsArray)
            }

            val requestBody = jsonBody.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=$apiKey")
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string().orEmpty()

            if (response.isSuccessful) {
                val rootJson = JSONObject(responseBody)
                val candidates = rootJson.optJSONArray("candidates")
                val firstCandidate = candidates?.optJSONObject(0)
                val content = firstCandidate?.optJSONObject("content")
                val parts = content?.optJSONArray("parts")
                val text = parts?.optJSONObject(0)?.optString("text")

                if (!text.isNullOrBlank()) {
                    AiResult.Success(text.trim())
                } else {
                    AiResult.Success(buildHeuristicCoachAdvice(studentName, studiedMinutesToday, totalSessions, weakTopics, strongTopics))
                }
            } else {
                // Graceful fallback to heuristic
                AiResult.Success(buildHeuristicCoachAdvice(studentName, studiedMinutesToday, totalSessions, weakTopics, strongTopics))
            }
        } catch (e: Exception) {
            AiResult.Success(buildHeuristicCoachAdvice(studentName, studiedMinutesToday, totalSessions, weakTopics, strongTopics))
        }
    }

    suspend fun getTopicExplanation(topic: String, subject: String): AiResult<String> = withContext(Dispatchers.IO) {
        val apiKey = try { BuildConfig.GEMINI_API_KEY } catch (e: Exception) { "" }
        if (!isConfigured()) {
            return@withContext AiResult.Success(
                "• Core Concept: $topic in $subject focuses on foundational principles and active problem-solving.\n" +
                "• High-Yield Strategy: Break down standard derivations and test with 3 timed past-paper problems.\n" +
                "• Active Recall Tip: Teach the mechanism out loud without looking at notes."
            )
        }

        try {
            val prompt = "Provide a high-yield, crystal-clear 3-point breakdown of the study topic '$topic' in '$subject' for high-school/college mastery. Keep it crisp, conceptual, and test-focused."
            val jsonBody = JSONObject().apply {
                val contentsArray = JSONArray()
                val contentObj = JSONObject().apply {
                    val partsArray = JSONArray()
                    partsArray.put(JSONObject().apply { put("text", prompt) })
                    put("parts", partsArray)
                }
                contentsArray.put(contentObj)
                put("contents", contentsArray)
            }

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=$apiKey")
                .post(jsonBody.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string().orEmpty()
            if (response.isSuccessful) {
                val rootJson = JSONObject(responseBody)
                val text = rootJson.optJSONArray("candidates")?.optJSONObject(0)
                    ?.optJSONObject("content")?.optJSONArray("parts")?.optJSONObject(0)?.optString("text")
                if (!text.isNullOrBlank()) AiResult.Success(text.trim())
                else AiResult.Error("Could not retrieve AI response")
            } else {
                AiResult.Error("Gemini API error: ${response.code}")
            }
        } catch (e: Exception) {
            AiResult.Error("Network error: ${e.localizedMessage}")
        }
    }

    private fun buildHeuristicCoachAdvice(
        name: String,
        studiedToday: Int,
        sessions: Int,
        weakTopics: List<String>,
        strongTopics: List<String>
    ): String {
        val primaryFocus = weakTopics.firstOrNull() ?: "upcoming high-priority topics"
        return """
            1. Target High Friction First: Dedicate your next 45-minute deep work block to $primaryFocus before cognitive fatigue sets in.
            2. Active Recall Interval: You've clocked ${studiedToday}m today across $sessions sessions. Test yourself with 5 rapid questions before concluding.
            3. Spaced Retention: Reinforce ${strongTopics.firstOrNull() ?: "core concepts"} in 48 hours for 15 minutes to lock in retention.
        """.trimIndent()
    }
}
