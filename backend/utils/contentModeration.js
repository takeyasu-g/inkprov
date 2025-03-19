import client from "./openAIClient.js";

// AI Content Moderation
async function ModeratePromptInput(content) {
    let flagged = false;
    let moderationFlagReason = "";
    const moderation = await client.moderations.create({
        model: "omni-moderation-latest",
        input: content
    })

    // If content is flagged, display reason
    if (moderation.results[0].flagged) {
        console.log(moderation.results[0].categories);
        flagged = true;
        for (let key in moderation.results[0].categories) {
          if (moderation.results[0].categories[key]) {
            moderationFlagReason = key;
          }
        }
    }
    else {
        flagged = false;
        moderationFlagReason = "";
    }

    return {
        flagged: flagged,
        reason: moderationFlagReason
    }
};

export default ModeratePromptInput;