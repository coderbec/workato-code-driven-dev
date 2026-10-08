

# In this guide {#in-this-guide}

[**In this guide**](#in-this-guide)	**[2](#in-this-guide)**

[**Introduction**](#introduction)	**[3](#introduction)**

[**Workato Naming Conventions**](#workato-naming-conventions)	**[4](#workato-naming-conventions)**

[Asset Types](#asset-types)	[4](#asset-types)

[Asset Grouping: Root Element](#asset-grouping:-root-element)	[5](#asset-grouping:-root-element)

[Unique Project Code](#unique-project-code)	[5](#unique-project-code)

[Single workspace](#single-workspace)	[5](#single-workspace)

[Naming Strategies](#naming-strategies)	[5](#naming-strategies)

[Function/team based](#function/team-based)	[5](#function/team-based)

[Initiative/process based](#initiative/process-based)	[6](#initiative/process-based)

[Federated Workspace](#federated-workspace)	[6](#federated-workspace)

[Naming Strategy](#naming-strategy)	[7](#naming-strategy)

[Asset Grouping: Default Folder Structure](#asset-grouping:-default-folder-structure)	[7](#asset-grouping:-default-folder-structure)

[API Project](#api-project)	[8](#api-project)

[BOT Project](#bot-project)	[8](#bot-project)

[Asset Naming Convention](#asset-naming-convention)	[9](#asset-naming-convention)

[**Shared Assets**](#shared-assets)	**[12](#shared-assets)**

[**Benefits**](#benefits)	**[13](#benefits)**

# Introduction {#introduction}

Naming conventions are often an overlooked component in any project or initiative. Many organizations tend to look at naming conventions as a “nice to have” rather than as a “foundational step” towards a scalable and maintainable solution.

Naming conventions are important because they provide a common language so that all the teams that interact with a given solution can quickly understand each other, which in turn minimizes onboarding and maintenance times. 

Other benefits can include but are not limited to:

* Improve discoverability  
* Avoid duplication of work  
* Promotes consistency   
* Reduces ambiguity and resulting operational mistakes

# Workato Naming Conventions {#workato-naming-conventions}

Specifically for Workato, a proper naming convention can define the long term success of your initiatives by creating a scalable and easy to understand  framework which ensures your assets are organized and discoverable.

In order to take a holistic naming convention approach, the first step is to understand what type of assets and capabilities are available within Workato.

## Asset Types {#asset-types}

The following is a list of the most common assets we can build within the Workato Platform:

| Asset Type | Asset Code | Description |
| ----- | :---: | ----- |
| Recipe | REC | Core Workato recipe |
| Reusable Function | RF | Recipe without trigger meant for reuse across automation projects |
| Local Function | LF | Recipe without trigger meant for modular development |
| API Endpoint | API | Callable recipe exposed as an API |
| Connection | CON | Cloud App Connection (R, W, RW could also be used to determine Read/Write access level) |
| Connection (OPA) | OPA | On-prem App Connection (R, W, RW could also be used to determine Read/Write access level) |
| Lookup Table | LT | Lookup tables |

## 

## Asset Grouping: Root Element {#asset-grouping:-root-element}

Asset grouping options and thus, naming conventions, will be based on your current Workato **deployment architecture** (Single workspace vs. Federated workspaces). This architecture will directly affect the naming convention for the “Root Element” and your “Automation/Project Name”. 

#### Unique Project Code {#unique-project-code}

The most important thing to highlight here is (regardless of the deployment architecture) the notion of a **\<Project\_Code\>** which should be treated as the unique Automation Project identifier (e.g. similar to what other products like JIRA do to easily identify specific projects)

1. ### Single workspace {#single-workspace}

In this setup multiple Teams/LoBs will coexist in a single workspace. The hierarchy for this setup is as follows: 

* Single Workspace   
  * Root **Project** as grouping mechanism  
    * **\[\<Project\_Code\>\] Folder** per Automation Project  
      * Default **Folder** Structure	

#### Naming Strategies  {#naming-strategies}

1. ##### Function/team based {#function/team-based}

   Define root projects for each Team/LoB and folders for each Automation Project underneath. This allows for clear decoupling of teams during custom role provisioning.  
     
* Root **Project** name: *\<Team/LoB\>*  
  * Automation Project **Folder**: *\[\<Project\_Code\>\] \<Project\_Name\>*  
    * *Default Folder Structure*


  **Example structure:**

* Sales  
  * \[CDH\] Customer 360 Data Hub  
    * Default Folder Structure

2. ##### Initiative/process based {#initiative/process-based}

   Define root projects for each major cross-functional initiative or process with the respective Automation Projects underneath. This allows for close collaboration between cross-functional teams working on a given initiative.

* Root **Project** name: *\<Initiative/Process\>*  
  * Automation Project **Folder**: *\[\<Project\_Code\>\] \<Project\_Name\>*  
    * *Default Folder Structure*

  **Example structure:**

* Order Fulfillment  
  * \[Q2C\] Quote to Cash  
    * Default Folder Structure

2. ### Federated Workspace {#federated-workspace}

In this setup, each Team/LoB or initiative/process will have their own workspace by leveraging the new upcoming “Federated Workspaces” capability. The hierarchy for this setup is as follows: 

* Federated Workspace per Team/LoB or initiative/process  
  * **\[\<Project\_Code\>\] Project** per Automation Project  
    * Default **Folder** Structure

#### 

#### Naming Strategy {#naming-strategy}

Team/LoB’s or specific initiatives/processes are defined as federated workspaces allowing for a much more granular Automation Project lifecycle management. In this scenario, there is no need to have the root project as a “grouping mechanism”. Instead, each automation project can be treated as a separate root level project which enables better lifecycle management capabilities such as project promotion across environments.

* Automation **Project**: \[\<Project\_Code\>\] *\<Project\_Name\>*   
  * Default **Folder** Structure

**Example structure:**

* Customer 360 Data Hub \[CDH\]  
  * Default Folder Structure

## Asset Grouping: Default Folder Structure {#asset-grouping:-default-folder-structure}

Going one level deeper, regardless of the selected Workato deployment architecture, it is recommended to have a “default folder structure” inside of each automation project folder ideally based on the type of automation being implemented. 

Some folders to consider are:

* **Reusable Functions:** As mentioned in the taxonomy section, the purpose for Reusable Functions is to serve a similar purpose to APIs but within a Workato-only ecosystem. Just like APIs, the intention is to build reusable components that can be reused across Automation Projects.  
* **Local Functions:** Just as important is the concept of Local Functions. Since functions can be called from any recipe, the rationale behind local functions is to clearly delineate the “calling scope” meaning a “parent recipe” should only be calling “local functions” defined in the same hierarchy level.   
* **Main Folder:** Given the multiple potential assets that can form any given Automation project, the concept of a Main folder can provide clarity around where the core elements of a particular implementation are located.

In practice, and considering the different project types, this is a suggested folder structure for an API project and a BOT project:

### API Project {#api-project}

* \[\<Root\_Code\>\] \<Root\_Element\>  
  * API Endpoints  
    * Recipes  
    * Local Functions  
  * Reusable Functions  
  * Main Folder  
    * Recipes  
    * Local Functions

### BOT Project {#bot-project}

* \[\<Root\_Code\>\] \<Root\_Element\>  
  * Bots  
    * Slack  
      * AppHome  
      * Menus  
      * Commands  
  * Reusable Functions  
  * Main Folder  
    * Recipes  
    * Local Functions

The structure above is intended to provide clear asset boundaries for easier maintainability and extensibility as well as proper asset governance.

## Asset Naming Convention {#asset-naming-convention}

Putting everything together, the following is the recommended naming convention for Workato Assets:

| Project Code | Asset Code | Asset Name |
| :---- | :---- | :---- |
| Unique project identifier | Asset type unique identifier | Asset functional description |

**Example:**

| Project Code | Asset Code | Asset Name |
| :---- | :---- | :---- |
| CDH | REC | Customer 360 Data Hub |
| CDH | CON-RW | Salesforce with Read/Write access |
| CDH | RF | Salesforce account lookup |
| CDH | API | Get Customer 360 |
| CDH | BOT | Customer 360 workbot |
| CDH | LF | Aggregate customer |

**Resulting asset names:**

* \[CDH\] REC | Customer 360 Data Hub  
* \[CDH\] CON-RW | Salesforce  
* \[CDH\] RF | Salesforce account lookup  
* \[CDH\] API | Get Customer 360  
* \[CDH\] BOT | Customer 360 workbot  
* \[CDH\] LF | Aggregate customer

**Resulting final structure:**

1. ***Single workspace for all Teams/LoBs***  
* Sales  
  * Connections

    *\[CDH\] CON-RW | Salesforce*

  * \[CDH\] Customer 360 Data Hub  
    * API Endpoints  
      * Recipes  
        *\[CDH\] API | Get Customer 360*  
    * Bots  
      * Slack

        *\[CDH\] BOT | Customer 360 workbot*

    * Reusable Functions

      *\[CDH\] RF | Salesforce account lookup*

    * Main  
      * Recipes

        *\[CDH\] REC | Customer 360 Data Hub*

      * Local Functions

        *\[CDH\] LF | Aggregate customer*

2. ***Federated workspaces with Projects***  
* Connections

  *\[CDH\] CON-RW | Salesforce*

* \[CDH\] Customer 360 Data Hub  
  * API Endpoints  
    * Recipes  
      *\[CDH\] API | Get Customer 360*  
  * Bots  
    * Slack  
      *\[CDH\] BOT | Customer 360 workbot*  
  * Reusable Callables

    *\[CDH\] RF | Salesforce account lookup*

  * Main  
    * Recipes

      *\[CDH\] REC | Customer 360 Data Hub*

    * Local Functions  
      *\[CDH\] LF | Aggregate customer*

# 

# Shared Assets {#shared-assets}

As a standard practice, include application connections and callable recipes shared across automation projects in the top-level folders. 

* Shared connections  
  For connections shared across functional areas, you can place them at the root of the Team/LoB Project to export them.




# 

# Benefits {#benefits}

* Improved discoverability

![][image1]

* Promotes consistency and avoids duplication

![][image2]  


[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>