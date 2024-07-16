document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach((tab) => {
                tab.classList.remove("selected");
                tab.setAttribute("aria-selected", "false");
            });
            panels.forEach((panel) => {
                panel.classList.remove("selected")
            });

            tab.setAttribute("aria-selected", "true");
            panels[index].classList.add("selected");
        });
    });
});