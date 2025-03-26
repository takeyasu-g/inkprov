import client from "./openAIClient.js";

// AI Content Moderation
async function ModeratePromptInput(content, isMature) {
    let flagged = false;
    let moderationFlagReason = "";
    let highestModerationPercentage = 0;
    let moderationFlagReasons = [];
    const moderation = await client.moderations.create({
        model: "omni-moderation-latest",
        input: content
    })
    
    // If content is flagged, display reason
    if (moderation.results[0].flagged) {
        for (let key in moderation.results[0].categories) {
          if (moderation.results[0].categories[key]) {
            let flaggedReasonData = {
                reason: key,
                percentage: moderation.results[0].category_scores[key]
            }
            moderationFlagReasons.push(flaggedReasonData);
          }
        }

        if(moderationFlagReasons.length > 0) {
            flagged = true;
            moderationFlagReasons.forEach((flaggedReason) => {
                if(flaggedReason.percentage > highestModerationPercentage) {
                    highestModerationPercentage = flaggedReason.percentage
                    moderationFlagReason = flaggedReason.reason
                }
            })
        }
        if(!isMature && moderation.results[0].category_scores[moderationFlagReason] > 0.61) {
            flagged = true;
        }
        else if(isMature && moderation.results[0].category_scores[moderationFlagReason] > 0.75){
            flagged = true;
        }
        else {
            flagged = false;
            moderationFlagReason = "";
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