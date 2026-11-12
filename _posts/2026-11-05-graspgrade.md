---
title: "GraspGrade: Finding hand videos a robot can learn from"
category: project
description: A project that scores first-person hand videos for how well a robot hand could copy the grasp.
---

Yesterday our team submitted [GraspGrade](https://graspgrade.vercel.app/). It takes first-person videos of hands using objects, cuts them into clips at each touch, and scores every clip from 0 to 100 for how well a robot hand could copy the grasp.

## The problem

Robots don't have data at internet scale the way language models do. Recording robot data by remote control is slow and costly. Human first-person video is much easier to collect, but a human hand is not a robot hand. Fingers get hidden, the object may be too big for a robot hand, or it's unclear when the hand actually touches the object. Today, clips are mostly picked by just looking at the video.

<figure class="post-figure">
  <img src="{{ '/assets/posts/graspgrade/try-result.jpg' | relative_url }}" alt="GraspGrade Try page: a hand clip next to its score of 75 out of 100 and a motion capture check saying the robot hand can copy it">
</figure>

## How it works

Video is the only input.

1. Take frames at 5 per second and ask Muse Spark, for each hand, whether it is touching an object.
2. Shift each contact start a little later and each end a little earlier. We learned this shift from tactile glove data.
3. Cut one clip per contact and get hand and object masks from SAM 3.1.
4. Grade 12 checklist items for each clip as high, mid, or low, and combine them into a 0 to 100 score.

<figure class="post-figure">
  <img src="{{ '/assets/posts/graspgrade/try-grades.jpg' | relative_url }}" alt="GraspGrade Try page: a touch segment with grades from the video, SAM 3.1, and the Muse Spark checklist">
</figure>

## How we checked it

The part I cared about most was measuring against real sensor data instead of our own guesses.

- **When does the touch start and end?** We compared against a tactile glove dataset (OpenGraph). Asking Muse Spark directly plus the learned shift worked best, raising boundary F1 (±5 frames) from 0.074 to 0.195.
- **Can a robot hand copy the grasp?** We built labels from motion capture (HOT3D), mapped onto an Allegro robot hand. On 1,426 held-out clips, our checklist score reached an AUC of 0.624, while asking Muse Spark in one go was 0.501, no better than chance.

Every rule was fixed before we scored the held-out data, and both label sets are open as a benchmark.

## What I learned

The results were humbler than I expected. Asking through a checklist helped, but learning the weights added almost nothing. The score works at the object level and can't rank different grasps of the same object. We wrote these limits on the site instead of hiding them.

When labeled data for an object already exists, it is more useful than our score. But when there are no labels, this method can still help, and it saves the time and resources it takes to collect them.

Still, setting the measurement plan first and then building toward it was a good way to work.

Git: <https://github.com/joonselim/graspgrade>  
Demo: <https://graspgrade.vercel.app/demo.html>  
Try: <https://graspgrade.vercel.app/try.html>  
Video source: HOT3D, Meta Platforms Technologies (CC BY-SA 4.0)
