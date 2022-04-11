sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


drawCurrentPng = function (canvas, rootIndex, side, sectionType, blockNumber, stepIndex) {
    let sideIndex = 0;
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    let baseImage = new Image();
    let folder = sectionType == 'game' ?'img_dentist_task/': 'img_dentist_task/practice/';
    baseImage.src = folder + blockNumber + '_' + rootIndex + '_' + stepIndex + '.png';
    if (side == 'l') {
        sideIndex = 0;
    } else if (side == 'r') {
        sideIndex = 1;
    }
    baseImage.onload = function () {
        ctx.drawImage(baseImage, Math.pow(3, sideIndex % 2)*(canvas.width / 4) - (baseImage.width / 2), (canvas.height / 2) - (baseImage.height / 2));
    }
};
highlight = function(canvas, rightNodeIndex, leftNodeIndex, side, sectionType, blockNumber, stepIndex) {
    let sideIndex = 0;
    let sideIndexNotSelected = 0;
    let ctx = canvas.getContext("2d");
    let rootIndex = side == 'r' ? rightNodeIndex: leftNodeIndex
    ctx.beginPath();
    let baseImage = new Image();
    let folder = sectionType == 'game' ?'img_dentist_task/': 'img_dentist_task/practice/';
    baseImage.src = folder + blockNumber + '_' + rootIndex + '_' + stepIndex + '.png';

    if (side == 'l') {
        sideIndex = 0;
        sideIndexNotSelected = 1;
    } else if (side == 'r') {
        sideIndex = 1;
        sideIndexNotSelected = 0;
    }

    ctx.rect(Math.pow(3, sideIndexNotSelected % 2)*(canvas.width / 4) - (baseImage.width / 2), (canvas.height / 2) - (baseImage.height / 2), baseImage.width, baseImage.height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3; 
    ctx.strokeRect(Math.pow(3, sideIndex % 2)*(canvas.width / 4) - (baseImage.width / 2), (canvas.height / 2) - (baseImage.height / 2), baseImage.width, baseImage.height);

}

drawText = function (canvas, content) {
    let ctx = canvas.getContext("2d");
    ctx.font = "60px Georgia";
    ctx.fillText(content, canvas.width/2, canvas.height/2);
};


drawShift = function(canvas, stepNumber, sectionType) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    let baseImage = new Image();
    let folder = sectionType == 'game' ? 'img_dentist_task/' : 'img_dentist_task/practice/';
    baseImage.src = folder + stepNumber + '.png';
    baseImage.onload = function () {
        ctx.drawImage(baseImage, canvas.width / 2 - baseImage.width / 2, canvas.height / 3 - baseImage.height / 2);
    }
};
rewardInShift = function(canvas, currentReward, sectionType) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    let baseImage = new Image();
    let folder = sectionType == 'game' ? 'img_dentist_task/rewards/': 'img_dentist_task/practice/rewards/';
    let state = currentReward > 0 ? 'win_' : 'lose_';
    baseImage.src = folder +  state + currentReward + '.png';
    baseImage.onload = function () {
        ctx.drawImage(baseImage, canvas.width / 2 - baseImage.width / 2, canvas.height / 2 - baseImage.height / 2);
    }

};

getReward = function (rootNodeIndex, treeMaximalDepth, trialIndex, stepNumber, blockNumber) {
    let rewardsProbabilities;
    rewards = [1, 2, 3, 4, 5, 6];
    numberOfRewardsToSample = 1;
    if ((rootNodeIndex == 2 & stepNumber == 1) | (rootNodeIndex == 3 & stepNumber == 3)) { //lowToHigh negative probability
        rewardsProbabilities = [0.3, 0.3, 0.17, 0.12, 0.07, 0.03]; //[30, 30, 17, 12, 7, 3];
    } else if (stepNumber == 2) { //second step
        rewardsProbabilities = [0.16667,0.16667,0.16667,0.16667,0.16667,0.16667];
    }
    else { //highToLow positive probability
        rewardsProbabilities = [0.03, 0.07, 0.12, 0.17, 0.3, 0.3]; //[3, 7, 12, 17, 30, 30];
    }
    let proabableReward = jsPsych.randomization.sampleWithReplacement(rewards, numberOfRewardsToSample, rewardsProbabilities);
    return [proabableReward[0], rewardsProbabilities[rewards.indexOf(proabableReward[0])]];
};

drawPics = function (games, treeMaximalDepth, experimentalIndex, trialIndex, currentDepth, nodeIndex, blockNumber) {
    let currentReward = 0;
    let stepNumber = 0;
    let leftNodeIndex = nodeIndex * 2;
    let rightNodeIndex = 1 + (nodeIndex * 2);
    let switchNodes = Math.round(Math.random());
    // Random 0 or 1
    if(switchNodes) {
        tempIndex = leftNodeIndex
        leftNodeIndex = rightNodeIndex
        rightNodeIndex = tempIndex
    }
    return {
        type: 'canvas-keyboard-response',
        stimulus: function (c) {
            drawCurrentPng(c, leftNodeIndex, 'l', games[experimentalIndex].type, games[experimentalIndex].block, 0);
            drawText(c, '+');
            drawCurrentPng(c, rightNodeIndex, 'r', games[experimentalIndex].type, games[experimentalIndex].block, 0);
        },
        choices: ['s','k'],
        canvas_size: [window.screen.height * 0.8, window.screen.width * 0.8],
        trial_duration: 6000,
        data: {
            stimulus: [leftNodeIndex, rightNodeIndex],
            offer_left: leftNodeIndex,
            offer_left_type: leftNodeIndex == 2 ? 'lowToHigh':'highToLow',
            offer_right: rightNodeIndex,
            offer_right_type: rightNodeIndex == 2 ? 'lowToHigh':'highToLow',
            task: 'response',
            phase: games[experimentalIndex].type,
            treeMaximalDepth: treeMaximalDepth,
            stepNumber: stepNumber,
            trialNumber: trialIndex,
            rewardInCurrentStep: currentReward,
            experimentalIndex: experimentalIndex,
            blockNumber: blockNumber
        },
        response_ends_trial: true,
        pre_teardown: function(c, data) {
            highlight(c, rightNodeIndex, leftNodeIndex, data.key.toUpperCase() == 'S' ? 'l' : 'r', games[experimentalIndex].type, games[experimentalIndex].block, 0);
        },
        pre_teardown_duration: 1000,
        on_finish: function (data) {
            // if no response??
            if(data.response == null) {
                jsPsych.addNodeToEndOfTimeline(createBeFasterNode(games, experimentalIndex, leftNodeIndex, rightNodeIndex, treeMaximalDepth, currentDepth, trialIndex));
                createFinishNode(games, experimentalIndex, trialIndex + 1, games[experimentalIndex].block);
            } else {
                console.log(data);
                let response = data.response;
                let selectedNodeIndex = response.toUpperCase() == 'S' ? leftNodeIndex : rightNodeIndex;
                let side = response.toUpperCase() == 'S' ? 'l' : 'r';
                
                jsPsych.data.addDataToLastTrial({choice: selectedNodeIndex});
                jsPsych.data.addDataToLastTrial({choiceType: selectedNodeIndex == 2 ? 'lowToHigh':'highToLow'});
                               
                jsPsych.addNodeToEndOfTimeline(fixation);
                stepNumber = stepNumber + 1;
                jsPsych.addNodeToEndOfTimeline(createBranch(games, experimentalIndex, selectedNodeIndex, treeMaximalDepth, trialIndex, side, games[experimentalIndex].type, blockNumber, stepNumber));
            }  
        } 
    }
};

createBranch = function(games, experimentalIndex, rootNodeIndex, treeMaximalDepth, trialIndex, side, sectionType, blockNumber, stepNumber) {
    rewardData = getReward(rootNodeIndex, treeMaximalDepth, trialIndex, stepNumber, blockNumber);
    currentReward = rewardData[0];
     currentRewardProbability = rewardData[1];
    return{
        type: 'canvas-keyboard-response',
        stimulus: function (c) {
            drawShift(c, stepNumber, sectionType);
        },
        choices: jsPsych.NO_KEYS,
        canvas_size: [window.screen.height * 0.8, window.screen.width * 0.8],
        trial_duration: 2000,
        data: {
            choice: rootNodeIndex,
            task: 'branch',
            phase: sectionType,
            treeMaximalDepth: treeMaximalDepth,
            stepNumber: stepNumber,
            branchStimulus: blockNumber+rootNodeIndex+stepNumber, // check if works
            trialNumber: trialIndex,
            rewardInCurrentStep: currentReward,
            currentRewardProbability: currentRewardProbability,
            experimentalIndex: experimentalIndex,
            blockNumber: blockNumber
        },
        pre_teardown_stall: 500,
        pre_teardown: function(c) { //TODO
            rewardInShift(c, currentReward, sectionType);
        },
        pre_teardown_duration: 1000,
        on_finish: function (data) {
            console.log(data);
            jsPsych.addNodeToEndOfTimeline(fixation);
            //more steps in the trial
            if(stepNumber < treeMaximalDepth) {
                jsPsych.addNodeToEndOfTimeline(createBranch(games, experimentalIndex, rootNodeIndex, treeMaximalDepth, trialIndex, side, sectionType, blockNumber, stepNumber+1));
            } else {
                //create next trial
                createFinishNode(games, experimentalIndex, trialIndex + 1, blockNumber);                
            }
        }
    }
};

createBeFasterNode = function(games, experimentalIndex, leftNodeIndex, rightNodeIndex, treeMaximalDepth, currentDepth, trialIndex) {
    return {        
        type: 'html-keyboard-response',
        stimulus: '<p style="text-align: center">You need to be faster</p>'
        +'<p style="text-align: center">Try to choose faster on the next trial</p>',
        choices: "NO_KEYS",
        canvas_size: [window.screen.height * 0.8, window.screen.width * 0.8],
        trial_duration: 3000,
        data: {
            stimulus: [leftNodeIndex, rightNodeIndex],
            task: 'no_response',
            phase: games[experimentalIndex].type,
            treeMaximalDepth: treeMaximalDepth,
            currentDepth: currentDepth,
            trialNumber: trialIndex,
            isLeaf: currentDepth==1 ? 1 : 0
        },
    }
};


createStartBlock = function(blocklNumber, sectionType) {
    let folder = sectionType == 'game' ? 'img_dentist_task/': 'img_dentist_task/practice/'; 
    var startBlock = {
        type: 'html-keyboard-response',
        stimulus: '<p style="text-align: center">In the following days you will be asked to choose between the following two food stalls:</p>'
        +'<img style="text-align: center" class= example_state src="' + folder +'block_' + blocklNumber + '.png"><br>'
        +'<p style="text-align: center">Depending on how you feel, you are welcome to take a few moments break</p>'
        +'<p style="text-align: center">Press any key to continue</p>',
    };
    return(startBlock);
};

createFinishNode = function(games, experimentalIndex, trialIndex, blockNumber) {
    var miniBreak = {
        type: 'html-keyboard-response',
        stimulus: '<p style="text-align: center">Depending on how you feel, you are welcome to take a few moments break<br><br></p>'
        +'<pstyle="text-align: center">Press any key to continue</p>',
    };
    jsPsych.addNodeToEndOfTimeline(fixation);
    jsPsych.addNodeToEndOfTimeline(fixation);
    // more trials in the same block
    if (trialIndex < games[experimentalIndex].totalNumberOfTrials) {
        jsPsych.addNodeToEndOfTimeline(createTreeNode(games, games[experimentalIndex].depth, experimentalIndex, trialIndex, games[experimentalIndex].depth, 1, blockNumber));
    } else if (experimentalIndex + 1 < games.length) {
        jsPsych.addNodeToEndOfTimeline(createStartBlock(games[experimentalIndex + 1].block, games[experimentalIndex + 1].type));
        jsPsych.addNodeToEndOfTimeline(fixation);
        jsPsych.addNodeToEndOfTimeline(createTreeNode(games, games[experimentalIndex + 1].depth, experimentalIndex + 1, 0, games[experimentalIndex + 1].depth, 1, games[experimentalIndex + 1].block));
    } 
    return;
};

createTreeNode = function (games, treeMaximalDepth, experimentalIndex, trialIndex, currentDepth, nodeIndex, blockNumber) {
    return drawPics(games, treeMaximalDepth, experimentalIndex, trialIndex, currentDepth, nodeIndex, blockNumber);
};