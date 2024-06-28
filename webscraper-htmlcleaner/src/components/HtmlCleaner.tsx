import { useState } from 'react'

const cleanHTML = async (htmlContent) => {
    const regex = /(<nav\b[^>]*>[\s\S]*?<\/nav>)|(\s*\S*\="[^"]+"\s*)/gm;
    const cleanedHTML = await htmlContent.replace(regex, "");

    return cleanedHTML;
};

function Cleaner() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    // const [inputType, setInputType] = useState('link')


    const handleChange = async (e) => {
        let userInput = e.target.value
        setInput(userInput)
    }

    const submitInput = async (e) => {
        e.preventDefault()
        let cleaned = await cleanHTML(input)
        setOutput(cleaned)

    }

    const copyText = () => {
        navigator.clipboard.writeText(output)

    }


    return (
        <div className='mt-16'>
            <div className='flex flex-col gap-4 w-full justify-center mt-10'>
                <div className='w-full'>
                    <h2>Input HTML</h2>
                    <form onSubmit={submitInput}>
                        <div className="mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                                <label htmlFor="comment" className="sr-only">Your comment</label>
                                <textarea onChange={handleChange} id="comment" rows="4" className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write a comment..." required ></textarea>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                                <button type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className=' w-full '>
                    <h2>Ouput HTML</h2>
                    {
                        input && <div className='min-h-56 max-h-60 overflow-y-scroll mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-full'>

                            {output}

                        </div>

                    }

                </div>
                <div className='flex flex-row gap-4'>
                    <button onClick={copyText} className="mb-4 inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
                        Copy to clipboard
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Cleaner
