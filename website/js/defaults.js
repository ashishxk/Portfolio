/* Sample content shown until you press "Save changes" in the admin website. */
window.PF_DEFAULT = {
    profile: {
        name: "Ashish Kumar", roles: "Web Developer, UI Designer, Creative Problem Solver",
        tagline: "I design and build fast, beautiful websites that people enjoy using.",
        intro: "Welcome! I turn ideas into clean, responsive and interactive web experiences, from the first sketch to a live website.",
        about: "I am a developer and designer who loves building things for the web. I care about clean code, smooth interactions and design that feels effortless.\n\nWhen I am not coding I like learning new tools, helping my community and finding better ways to solve problems.",
        photo: "images/ashish.jpg", resume: "", email: "", phone: "", location: "", available: true,
        social: { GitHub: "", LinkedIn: "", Instagram: "", Twitter: "", YouTube: "" }
    },
    stats: [{ value: "3+", label: "Years learning and building" }, { value: "20+", label: "Projects" }, { value: "100%", label: "Passion" }],
    skills: [["HTML & CSS", "Frontend", 92], ["JavaScript", "Frontend", 88], ["React", "Frontend", 80], ["UI / UX Design", "Design", 84], ["Node.js", "Backend", 72], ["Supabase / SQL", "Backend", 76], ["Git & GitHub", "Tools", 82], ["Figma", "Design", 78]].map(s => ({ name: s[0], cat: s[1], level: s[2] })),
    projects: [
        { title: "Parish website with admin", desc: "A responsive community website with a photo carousel, albums and an admin panel for editing content.", tags: "Web, Supabase, JavaScript", link: "", repo: "", cover: "", photos: [] },
        { title: "Portfolio website", desc: "This portfolio: animated, dark-mode ready and fully editable from its own admin website.", tags: "Web, Design, Supabase", link: "", repo: "", cover: "", photos: [] },
        { title: "Your next project", desc: "Add your real projects, screenshots and links from the admin website.", tags: "Design, Web", link: "", repo: "", cover: "", photos: [] }],
    experience: [{ role: "Freelance Web Developer", org: "Self-employed", period: "2023 - Present", desc: "Building websites and web apps for clients, from design to deployment." }, { role: "Web Development Intern", org: "Your company here", period: "2022 - 2023", desc: "Worked on real projects and learned modern frontend and backend tools." }],
    education: [{ role: "Your degree or course", org: "Your college or university", period: "2019 - 2023", desc: "Add your studies, certificates and achievements here." }],
    saved: false
};
