<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<div align="center">
  <a href="https://github.com/joshlobe/hubitat">
    <img src="images/logo.svg" alt="Logo">
  </a>

  <h3 align="center">Rule Machine Manager</h3>
  <p align="center">
    <a href="https://github.com/joshlobe/hubitat"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://github.com/joshlobe/hubitat">View Demo</a>
    ·
    <a href="https://community.hubitat.com/t/initial-release-rule-machine-manager-new-rule-machine-interface/">Report Bug</a>
    ·
    <a href="https://community.hubitat.com/t/initial-release-rule-machine-manager-new-rule-machine-interface/">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#screenshots">Screenshots</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

Rule Machine Manager is an application built for the Hubitat home automation system. It takes the created rules from Rule Machine, and adds them to a visually stimulating interface which allows custom sorting and grouping.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Screenshots

[![Screenshot One][screenshot-one]](images/rmm_1.jpg)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Groovy][Groovy]][Groovy-url] [![JQuery][JQuery.com]][JQuery-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

*Available Via Hubitat Package Manager (Recommended)

This app is available via Hubitat Package Manager.<br />
Simply search for "Rule Machine Manager" and install the package.

*Local Installation

1. Visit Apps Code -> New App ->, and paste the .groovy code from [HERE](https://raw.githubusercontent.com/joshlobe/hubitat/main/rule_machine_manager/rule_machine_manager.groovy) into the window and save.
2. Download the required javascipt file from [HERE](https://raw.githubusercontent.com/joshlobe/hubitat/main/rule_machine_manager/rule_machine_manager.js) and save it into your hub file manager. The filename should be saved as "rule_machine_manager.js".
3. Download the required stylesheet file from [HERE](https://raw.githubusercontent.com/joshlobe/hubitat/main/rule_machine_manager/rule_machine_manager.css) and save it into your hub file manager. The filename should be saved as "rule_machine_manager.css".
4. Go to Apps -> Add User App -> and click "Rule Machine Manager".
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

This application takes the rules created from Rule Machine; and lays them out into an interface which can be used to custom sort, arrage and group the rules.  New groups can be created and modified.  Rules can be dragged/dropped into the groups.  All settings are stored and retrieved the next time the page is loaded.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [ ] Bring in rules from other machines (room lighting, button controllers, etc.).
- [ ] Ability to add groups under groups.

See the [Hubitat Community forum for Rule Machine Manager](https://community.hubitat.com/t/initial-release-rule-machine-manager-new-rule-machine-interface/) for the full discussion regarding this application.<br />
Also check [open issues](https://github.com/joshlobe/hubitat/issues) for a full list of proposed features (and known issues), tracked by the developer.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Project Link: [https://github.com/joshlobe/hubitat](https://github.com/joshlobe/hubitat)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/joshlobe/hubitat.svg?style=for-the-badge
[contributors-url]: https://github.com/joshlobe/hubitat/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/joshlobe/hubitat.svg?style=for-the-badge
[forks-url]: https://github.com/joshlobe/hubitat/network/members
[stars-shield]: https://img.shields.io/github/stars/joshlobe/hubitat.svg?style=for-the-badge
[stars-url]: https://github.com/joshlobe/hubitat/stargazers
[issues-shield]: https://img.shields.io/github/issues/joshlobe/hubitat.svg?style=for-the-badge
[issues-url]: https://github.com/joshlobe/hubitat/issues
[license-shield]: https://img.shields.io/github/license/joshlobe/hubitat.svg?style=for-the-badge
[license-url]: https://github.com/joshlobe/hubitat/blob/master/LICENSE.txt

[screenshot-one]: images/rmm_1.jpg

[Groovy]: https://img.shields.io/badge/Groovy-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Groovy-url]: https://groovy-lang.org
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 