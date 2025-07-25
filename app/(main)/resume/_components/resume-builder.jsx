"use client"
import { saveResume } from '@/actions/resume'
import { resumeSchema } from '@/app/lib/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import useFetch from '@/hooks/use-fetch'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Download, Edit, Loader2, Monitor, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import EntryForm from './entry-form'
import { entriesToMarkdown } from '@/app/lib/helper'
import { useUser } from '@clerk/nextjs'
import MDEditor from '@uiw/react-md-editor'

import { file } from 'zod'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ResumeDocument } from './ResumeDocument'
import ClientOnly from './ClientOnly'

const ResumeBuilder = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState('edit');
    const [resumeMode, setResumeMode] = useState('preview');
    const [previewContent, setPreviewContent] = useState(initialContent);
    const { user } = useUser();

    const{
        control,
        watch,
        register,
        handleSubmit,
        formState: { errors },
        
    }   = useForm({
        resolver:zodResolver(resumeSchema),
        defaultValues: {
            contactInfo:{},
            summary:"",
            skills:"",
            experience:[],
            education:[],    
            projects:[],
        },
    });
    const{
        loading: isSaving,
        error: saveError,
        data: saveResult,
        fn: saveResumeFn,
    }= useFetch(saveResume);

    const formValues = watch();

    useEffect(() =>{
        if(initialContent) setActiveTab("preview");
    }, [initialContent]);

    useEffect(() => {
        if(activeTab === "edit"){
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }

    }, [formValues, activeTab]);

    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume saved successfully!");
        }
        if (saveError) {
            toast.error(saveError.message || "Failed to save resume");
        }
    }, [saveResult, saveError, isSaving]);


    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin)
        parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.github) parts.push(`🐙 [Github](${contactInfo.github})`);

        return parts.length > 0
        ? `## <div align="center">${user.fullName}</div>
            \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
        : "";
    };

    const getCombinedContent = () =>{
        const {summary, skills, experience, education, projects} = formValues;

        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience, "Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ]
        .filter(Boolean)
        .join("\n\n");
    };

    const onSubmit = async (data) => {
  try {
    // CORRECT: Pass the entire validated form data object
    await saveResumeFn(data); 
  } catch (error) {
    // Optional: Add a toast notification for the error
    toast.error(error.message || "Failed to save resume");
    console.error("Save error:", error);
  }
};

const cleanArray = (arr) => Array.isArray(arr) ? arr.filter(Boolean) : [];

const cleanedFormValues = {
  ...formValues,
  experience: cleanArray(formValues.experience),
  education: cleanArray(formValues.education),
  projects: cleanArray(formValues.projects),
};

  return (
    <div className='space-y-4'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-2'>
            <h1 className='text-5xl gradient-title font-bold md:text-6xl'>
                Resume Builder
            </h1>

            <div className='space-x-2'>
                <ClientOnly>
                <PDFDownloadLink
                    document={<ResumeDocument resumeData={cleanedFormValues} />}
                    fileName={`${formValues.contactInfo?.fullName || 'resume'}-resume.pdf`}
                >
                    {({ loading }) => (
                    <Button disabled={loading}>
                        {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating PDF...
                        </>
                        ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Download PDF
                        </>
                        )}
                    </Button>
                    )}
                </PDFDownloadLink>
                </ClientOnly>
            </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
                <TabsTrigger value="edit">Form</TabsTrigger>
                <TabsTrigger value="preview">Markdown</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
                <form className='space-y-8' onSubmit={handleSubmit(onSubmit)}>
                    <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>Contact Info</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50'>
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Email</label>
                                <Input
                                {...register("contactInfo.email")}
                                type="email"
                                placeholder="your@email.com"
                                error={errors.contactInfo?.email}
                                />

                                {errors.contactInfo?.email && (
                                    <p className='text-red-500 text-sm'>
                                        {errors.contactInfo.email.message}
                                    </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Mobile</label>
                                <Input
                                {...register("contactInfo.mobile")}
                                type="tel"
                                placeholder="+91 1234567890"
                                error={errors.contactInfo?.mobile}
                                />

                                {errors.contactInfo?.mobile && (
                                    <p className='text-red-500 text-sm'>
                                        {errors.contactInfo.mobile.message}
                                    </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>LinkedIn</label>
                                <Input
                                {...register("contactInfo.linkedin")}
                                type="url"
                                placeholder="https://www.linkedin.com/in/your-profile"
                                error={errors.contactInfo?.linkedin}
                                />

                                {errors.contactInfo?.linkedin && (
                                    <p className='text-red-500 text-sm'>
                                        {errors.contactInfo.linkedin.message}
                                    </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Github</label>
                                <Input
                                {...register("contactInfo.github")}
                                type="url"
                                placeholder="https://github.com/your-profile"
                                error={errors.contactInfo?.github}
                                />

                                {errors.contactInfo?.github && (
                                    <p className='text-red-500 text-sm'>
                                        {errors.contactInfo.github.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Professional Summary</h3>
                        <Controller
                            name="summary"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    className="h-32"
                                    placeholder="Write a compelling professional summary..."
                                    error={errors.summary}
                                />  
                            )}
                        />
                        {errors.summary && (
                            <p className="text-sm text-red-500">{errors.summary.message}</p>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Work Experience</h3>
                        <Controller
                            name="experience"
                            control={control}
                            render={({ field }) => (
                                <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />
                            )}
                        />
                        {errors.experience && (
                            <p className="text-sm text-red-500">{errors.experience.message}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Education</h3>
                        <Controller
                            name="education"
                            control={control}
                            render={({ field }) => (
                                <EntryForm type="Education" entries={field.value} onChange={field.onChange} />
                            )}
                        />
                        {errors.education && (
                            <p className="text-sm text-red-500">{errors.education.message}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Projects</h3>
                        <Controller
                            name="projects"
                            control={control}
                            render={({ field }) => (
                                <EntryForm type="Projects" entries={field.value} onChange={field.onChange} />
                            )}
                        />
                        {errors.projects && (
                            <p className="text-sm text-red-500">{errors.projects.message}</p>
                        )}
                    </div>
                </form>    
            </TabsContent>
            <TabsContent value="preview">
                <Button variant="link" 
                        type="button" 
                        className="mb-2" 
                        onClick={() => setResumeMode(resumeMode === 'preview' ? 'edit' : 'preview')}>
                    {resumeMode === 'preview' ? (
                        <>
                        <Edit className='h-4 w-4'/>
                            Edit Resume
                        </>
                    ) : (
                        <>
                        <Monitor className='h-4 w-4'/>
                            Show Preview
                        </>
                    )}
                </Button>

                {activeTab === "preview" && resumeMode !== "preview" && (
                    <div className="flex p-3 gap-2 items-center border-2 border-orange-600 text-orange-600 rounded mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">
                            You will lose edited markdown if you update the form data.
                        </span>
                    </div>
            )}

            <div className="border rounded-lg">
                <MDEditor
                value={previewContent}
                onChange={setPreviewContent}
                height={800}
                preview={resumeMode}
                />
            </div>

            </TabsContent>
        </Tabs>
    </div>
  )
}


export default ResumeBuilder