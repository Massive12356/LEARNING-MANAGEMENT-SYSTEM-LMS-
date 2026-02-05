 export  const normalizeCourseData = (data: any) => {
    console.log('Normalizing course data:', data); // Debug log
    // Create a mapping of lesson IDs to lesson objects for easy lookup
    const lessonMap = new Map<number, any>();

    data.content.forEach((lesson: any) => {
      console.log('Processing lesson:', lesson); // Debug log
      lessonMap.set(lesson.id, {
        id: lesson.id.toString(), // Convert to string to match expected type
        title: lesson.title,
        description: lesson.lessonDescription,
        type: lesson.lessonType,
        content:
          lesson.lessonType === 'video'
            ? {
                type: lesson.videoUrl?.includes('youtu') ? 'embed' : 'upload',
                url: !lesson.videoUrl?.includes('youtu') ? lesson.videoUrl : undefined,
                embedUrl: lesson.videoUrl?.includes('youtu') ? lesson.videoUrl : undefined,
              }
            : {
                html: lesson.textContent,
                pdfUrl: lesson.pdfUrl,
                fileUrl: lesson.fileAttachmentURL,
              },
        duration: lesson.videoDuration,
        lessonNumber: lesson.lessonNumber,
        quizQuestions: lesson.quizQuestions,
        quizPassingScore: lesson.quizPassingScore,
        quizDuration: lesson.quizDuration,
        quizMaxAttempts: lesson.quizMaxAttempts,
        reflectionPrompt: lesson.reflectionPrompt,
      });
    });

    // Process modules and associate lessons with each module
    const modules = data.modules.map((module: any) => ({
      id: module.id.toString(), // Convert to string to match expected type
      title: module.title,
      description: module.description,
      moduleNumber: module.moduleNumber,
      lessons: module.courseContentIds
        .map((id: number) => {
          const lesson = lessonMap.get(id);
          if (lesson) {
            // Add the module ID to the lesson for later reference
            lesson.moduleId = module.id.toString();
          }
          return lesson;
        })
        .filter((lesson: any) => lesson !== undefined),
    }));

    return {
      id: data.course.id.toString(), // Convert to string to match expected type
      title: data.course.title,
      description: data.course.description,
      coverImage: data.course.images?.[0], // Use first image as cover
      tags: data.course.tags || [],
      modules,
      settings: data.settings,
      teacher: data.teacher,
      organization: data.organization,
      enrollmentStats: data.enrollmentStats,
      enrolledStudents: data.enrolledStudents, // Add enrolled students
    };
  };