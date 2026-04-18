"use strict";
// AI Service using Firebase Functions with Vertex AI
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g.throw = verb(1), g.return = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateText = generateText;
exports.analyzeVibe = analyzeVibe;
exports.generateVibeSuggestion = generateVibeSuggestion;
exports.generateMediaCaptionSuggestion = generateMediaCaptionSuggestion;
exports.generateSearchSuggestion = generateSearchSuggestion;
exports.generateEchoSuggestion = generateEchoSuggestion;
exports.generateSchoolFeedback = generateSchoolFeedback;
exports.generateStudyTip = generateStudyTip;
exports.generateQuizQuestion = generateQuizQuestion;
exports.generateExploreContent = generateExploreContent;
exports.generateSearchBackedExploreResponse = generateSearchBackedExploreResponse;
exports.generateStudyHubResponse = generateStudyHubResponse;
exports.generateCuriosityQuestion = generateCuriosityQuestion;
exports.generateExplorationPath = generateExplorationPath;
exports.generatePersonalizedAdvice = generatePersonalizedAdvice;
exports.generateCreativePrompt = generateCreativePrompt;
exports.analyzeAndSuggest = analyzeAndSuggest;
exports.generateImageWithGrok = generateImageWithGrok;
exports.editImageWithGrok = editImageWithGrok;
exports.generateVideoScriptWithGrok = generateVideoScriptWithGrok;
exports.generateVideoConceptWithGrok = generateVideoConceptWithGrok;
var functions_1 = __importDefault(require("@react-native-firebase/functions"));
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var liveConfig_1 = require("../../liveConfig");
function generateTextViaXAI(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var response, text, payload, content;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, fetch('https://api.x.ai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer ".concat(liveConfig_1.XAI_API_KEY),
                        },
                        body: JSON.stringify({
                            model: liveConfig_1.XAI_MODEL || 'grok-2-latest',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are a concise assistant for a social app. Keep responses useful and safe.',
                                },
                                { role: 'user', content: prompt },
                            ],
                            temperature: 0.7,
                        }),
                    })];
                case 1:
                    response = _d.sent();
                    if (response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text().catch(function () { return ''; })];
                case 2:
                    text = _d.sent();
                    throw new Error("xAI request failed (".concat(response.status, "): ").concat(text));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    payload = _d.sent();
                    content = (_c = (_b = (_a = payload === null || payload === void 0 ? void 0 : payload.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                    if (!content || typeof content !== 'string') {
                        throw new Error('xAI returned an empty response');
                    }
                    return [2 /*return*/, content.trim()];
            }
        });
    });
}
function generateText(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var xaiError_1, currentUser, result, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    if (!liveConfig_1.XAI_API_KEY) return [3 /*break*/, 4];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateTextViaXAI(prompt)];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    xaiError_1 = _c.sent();
                    console.warn('xAI direct call failed, falling back to Firebase callable:', xaiError_1);
                    return [3 /*break*/, 4];
                case 4:
                    currentUser = (0, auth_1.default)().currentUser;
                    if (!currentUser) {
                        return [2 /*return*/, 'Please sign in to use AI features'];
                    }
                    return [4 /*yield*/, (0, functions_1.default)('us-central1').httpsCallable('generateAIResponse')({ prompt: prompt })];
                case 5:
                    result = _c.sent();
                    return [2 /*return*/, ((_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.response) || 'AI unavailable - please try again later'];
                case 6:
                    error_1 = _c.sent();
                    console.error('AI generation error:', error_1);
                    if ((_b = error_1.message) === null || _b === void 0 ? void 0 : _b.includes('unauthenticated')) {
                        return [2 /*return*/, 'Please sign in to use AI features'];
                    }
                    return [2 /*return*/, 'AI unavailable - please try again later'];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function analyzeVibe(text) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Analyze the vibe of this text and suggest improvements: ".concat(text);
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateVibeSuggestion() {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = 'Generate a creative and positive vibe message for a social app.';
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var summarizeVisionFromImage = function (imageUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var response, payload, content, _a;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (!liveConfig_1.XAI_API_KEY || !imageUrl)
                    return [2 /*return*/, null];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch('https://api.x.ai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer ".concat(liveConfig_1.XAI_API_KEY),
                        },
                        body: JSON.stringify({
                            model: liveConfig_1.XAI_MODEL || 'grok-3-mini',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'Describe visible scene content in one short sentence. Focus on concrete subject/action.',
                                },
                                {
                                    role: 'user',
                                    content: [
                                        { type: 'text', text: 'What is happening in this media?' },
                                        { type: 'image_url', image_url: { url: imageUrl } },
                                    ],
                                },
                            ],
                            temperature: 0.2,
                        }),
                    })];
            case 2:
                response = _e.sent();
                if (!response.ok)
                    return [2 /*return*/, null];
                return [4 /*yield*/, response.json()];
            case 3:
                payload = _e.sent();
                content = (_d = (_c = (_b = payload === null || payload === void 0 ? void 0 : payload.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
                return [2 /*return*/, typeof content === 'string' ? content.trim() : null];
            case 4:
                _a = _e.sent();
                return [2 /*return*/, null];
            case 5: return [2 /*return*/];
        }
    });
}); };
function generateMediaCaptionSuggestion(context) {
    return __awaiter(this, void 0, void 0, function () {
        var mediaKind, mimeType, fileName, width, height, durationSec, hasAudioOverlay, editsSummary, sceneHints, localPreviewObserved, mediaUrl, previewImageUrl, currentCaption, sizeHint, durationHint, audioHint, hintText, visionHint, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mediaKind = context.mediaKind, mimeType = context.mimeType, fileName = context.fileName, width = context.width, height = context.height, durationSec = context.durationSec, hasAudioOverlay = context.hasAudioOverlay, editsSummary = context.editsSummary, sceneHints = context.sceneHints, localPreviewObserved = context.localPreviewObserved, mediaUrl = context.mediaUrl, previewImageUrl = context.previewImageUrl, currentCaption = context.currentCaption;
                    sizeHint = width && height ? "".concat(width, "x").concat(height) : 'unknown dimensions';
                    durationHint = mediaKind === 'video' && durationSec
                        ? "".concat(Math.max(1, Math.round(durationSec)), "s")
                        : 'n/a';
                    audioHint = mediaKind === 'video'
                        ? hasAudioOverlay
                            ? 'with overlay audio'
                            : 'no overlay audio'
                        : hasAudioOverlay
                            ? 'with attached audio'
                            : 'no attached audio';
                    hintText = sceneHints && sceneHints.length > 0
                        ? sceneHints.join(', ')
                        : 'none';
                    return [4 /*yield*/, summarizeVisionFromImage(previewImageUrl || (mediaKind === 'image' ? mediaUrl : undefined))];
                case 1:
                    visionHint = _a.sent();
                    prompt = "Generate exactly one custom social caption for this ".concat(mediaKind, " post.\n") +
                        "Media details: kind=".concat(mediaKind, ", mime=").concat(mimeType || 'unknown', ", fileName=").concat(fileName || 'unknown', ", size=").concat(sizeHint, ", duration=").concat(durationHint, ", audio=").concat(audioHint, ".\n") +
                        "Local scene hints from filename/path/caption: ".concat(hintText, ".\n") +
                        "Visual scene summary: ".concat(visionHint || 'not available', ".\n") +
                        "Local preview observed before posting: ".concat(localPreviewObserved ? 'yes' : 'no', ".\n") +
                        "Edits applied: ".concat(editsSummary || 'none', ".\n") +
                        "Existing draft caption: \"".concat((currentCaption || '').trim() || 'none', "\".\n") +
                        'Rules: return only the caption text, no quotes, no numbering, no hashtags spam, maximum 140 characters. Be concrete and content-specific (for example dancing, flood water, football), never generic placeholders like "nice visual".';
                    return [4 /*yield*/, generateText(prompt)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateSearchSuggestion() {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = 'Suggest a creative username or keyword for searching users in a social app.';
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateEchoSuggestion(postContext) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, captionText, authorName, hasImage, hasVideo, mediaUrl, previewImageUrl, fileName, sceneHints, contextInfo, visionHint;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = 'Generate a thoughtful and positive echo (comment) for a social media post.';
                    if (!postContext) return [3 /*break*/, 2];
                    captionText = postContext.captionText, authorName = postContext.authorName, hasImage = postContext.hasImage, hasVideo = postContext.hasVideo, mediaUrl = postContext.mediaUrl, previewImageUrl = postContext.previewImageUrl, fileName = postContext.fileName, sceneHints = postContext.sceneHints;
                    contextInfo = '';
                    if (captionText && captionText.trim()) {
                        contextInfo += "The post text is: \"".concat(captionText, "\". ");
                    }
                    if (hasImage) {
                        contextInfo += 'The post includes an image. ';
                    }
                    if (hasVideo) {
                        contextInfo += 'The post includes a video. ';
                    }
                    if (fileName) {
                        contextInfo += "Media file name hint: \"".concat(fileName, "\". ");
                    }
                    if (sceneHints && sceneHints.length) {
                        contextInfo += "Scene hints: ".concat(sceneHints.join(', '), ". ");
                    }
                    if (authorName) {
                        contextInfo += "Posted by ".concat(authorName, ". ");
                    }
                    return [4 /*yield*/, summarizeVisionFromImage(previewImageUrl || (hasImage ? mediaUrl : undefined))];
                case 1:
                    visionHint = _a.sent();
                    if (visionHint) {
                        contextInfo += "Visual summary: ".concat(visionHint, ". ");
                    }
                    if (contextInfo.trim()) {
                        prompt = "Generate one thoughtful and positive echo (comment) for this social media post. ".concat(contextInfo, "Make the echo specific to what is happening in the media, not generic.");
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, generateText(prompt)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// School Mode AI Features
function generateSchoolFeedback(postContent, postType) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "As an educational AI assistant, provide constructive feedback on this ".concat(postType, " post for a school/educational context. Focus on learning value, clarity, and engagement: \"").concat(postContent, "\". Provide specific, actionable suggestions for improvement.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateStudyTip(subject) {
    return __awaiter(this, void 0, void 0, function () {
        var subjectPrompt, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subjectPrompt = subject ? " for ".concat(subject) : '';
                    prompt = "Generate a helpful study tip".concat(subjectPrompt, " that students can apply immediately. Make it practical and encouraging.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateQuizQuestion(topic) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Create an engaging quiz question about \"".concat(topic, "\" with 4 multiple choice options and indicate the correct answer. Format it clearly for educational purposes.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Explore Mode AI Features
function generateExploreContent(theme, contentType) {
    return __awaiter(this, void 0, void 0, function () {
        var prompts, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompts = {
                        story: "Create an engaging short story about \"".concat(theme, "\" that sparks curiosity and imagination."),
                        fact: "Share an interesting and lesser-known fact about \"".concat(theme, "\" that would fascinate and educate."),
                        activity: "Design a fun, hands-on activity related to \"".concat(theme, "\" that can be done at home or school."),
                        question: "Pose a thought-provoking question about \"".concat(theme, "\" that encourages deep thinking and discussion.")
                    };
                    prompt = prompts[contentType] || "Generate engaging content about \"".concat(theme, "\" for exploration and learning.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateSearchBackedExploreResponse(input) {
    return __awaiter(this, void 0, void 0, function () {
        var findings, findingsText, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    findings = (input.webFindings || []).filter(Boolean).slice(0, 8);
                    findingsText = findings.length ? findings.join('\n') : 'No external findings provided.';
                    prompt = "You are helping in Adventure Space (Explore Mode).\n" +
                        "User query: \"".concat(input.query, "\".\n") +
                        "Web findings:\n".concat(findingsText, "\n") +
                        "Task: Provide a concise, practical response with:\n" +
                        "1) A direct answer\n2) 3 quick facts\n3) 2 suggested next searches\n" +
                        "Keep it accurate, non-generic, and easy to read.";
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateStudyHubResponse(input) {
    return __awaiter(this, void 0, void 0, function () {
        var findings, findingsText, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    findings = (input.webFindings || []).filter(Boolean).slice(0, 10);
                    findingsText = findings.length ? findings.join('\n') : 'No external findings provided.';
                    prompt = "You are a Study Hub AI tutor.\n" +
                        "Study topic: \"".concat(input.query, "\".\n") +
                        "Subheading: \"".concat(input.subheading || 'General', "\".\n") +
                        "Web findings:\n".concat(findingsText, "\n") +
                        "Task: Give a learner-friendly answer with:\n" +
                        "1) Simple explanation\n2) Key points\n3) Practice question\n4) Suggested references from findings\n" +
                        "Be specific and educational.";
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateCuriosityQuestion(topic) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Generate a thought-provoking question about \"".concat(topic, "\" that would make someone curious and want to learn more. Make it engaging and open-ended.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateExplorationPath(startingPoint) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Create a learning exploration path starting from \"".concat(startingPoint, "\". Suggest 3-4 connected topics or questions that build upon each other to deepen understanding.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Advanced AI Features
function generatePersonalizedAdvice(userContext, requestType) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Based on this user context: \"".concat(userContext, "\", provide personalized ").concat(requestType, " advice. Be helpful, encouraging, and specific.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateCreativePrompt(medium) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Generate a creative prompt for ".concat(medium, " that inspires artistic expression and imagination.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function analyzeAndSuggest(content, analysisType) {
    return __awaiter(this, void 0, void 0, function () {
        var analysisPrompts, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    analysisPrompts = {
                        improvement: "Analyze this content and suggest specific improvements: \"".concat(content, "\""),
                        engagement: "How can this content be made more engaging for the target audience: \"".concat(content, "\""),
                        educational: "What educational value does this content have and how can it be enhanced: \"".concat(content, "\""),
                        creative: "Suggest creative ways to expand or reimagine this content: \"".concat(content, "\"")
                    };
                    prompt = analysisPrompts[analysisType] || "Analyze this content: \"".concat(content, "\"");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// GROK AI Media Creation and Editing Features
function generateImageWithGrok(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var enhancedPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    enhancedPrompt = "Create a detailed image generation prompt based on: \"".concat(prompt, "\". Include style, colors, composition, and mood.");
                    return [4 /*yield*/, generateText(enhancedPrompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function editImageWithGrok(imageDescription, editRequest) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Given this image description: \"".concat(imageDescription, "\", suggest how to edit it for: \"").concat(editRequest, "\". Provide specific editing instructions, filters, or modifications.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateVideoScriptWithGrok(theme_1) {
    return __awaiter(this, arguments, void 0, function (theme, duration) {
        var prompt;
        if (duration === void 0) { duration = '30 seconds'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Create a video script for a ".concat(duration, " video about \"").concat(theme, "\". Include scene descriptions, voiceover text, and visual suggestions. Structure it with timestamps.");
                    return [4 /*yield*/, generateText(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateVideoConceptWithGrok(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var enhancedPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    enhancedPrompt = "Develop a complete video concept based on: \"".concat(prompt, "\". Include theme, style, target audience, key scenes, music suggestions, and production notes.");
                    return [4 /*yield*/, generateText(enhancedPrompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
